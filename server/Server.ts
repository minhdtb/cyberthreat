import * as http from "http";
import {Application} from "./Application";
import * as SocketIO from "socket.io";
import * as AMQP from  "amqplib";
import {Message} from "../client/Message";
import DataService from "./services/DataService";
import * as winston from "winston";
const config = require('../../config.json');
const EXCHANGE_NAME = 'message';

export class Server {

    private io: any;
    private application: Application;
    private server: http.Server;
    private bindPort: Number;

    private appLogger: winston.LoggerInstance;

    constructor(app: Application, logger: winston.LoggerInstance) {
        this.application = app;
        this.appLogger = logger;
        this.application.server = this;
        this.server = http.createServer(this.application.express);
        this.io = SocketIO(this.server);

        AMQP.connect('amqp://localhost')
            .then((connection) => {
                connection
                    .createChannel()
                    .then((channel) => {
                        channel.assertExchange(EXCHANGE_NAME, 'fanout', {durable: false});
                        channel.assertQueue('', {exclusive: true})
                            .then((queue) => {
                                channel.bindQueue(queue.queue, EXCHANGE_NAME, '');

                                channel.consume(queue.queue, (msg) => {
                                    let values = msg.content.toString().split(',');
                                    if (values.length === 7) {
                                        let currentData = {
                                            name: values[0],
                                            domain: values[1],
                                            publicIP: values[2],
                                            location: values[3],
                                            macAddress: values[4],
                                            regionCode: values[5],
                                            countryCode: values[6]
                                        };

                                        this.sendBrowserMessage({
                                            id: 0,
                                            location: currentData.location,
                                            regionCode: currentData.regionCode,
                                            countryCode: currentData.countryCode,
                                            name: currentData.name
                                        });
                                    }
                                }, {noAck: true});

                                channel.consume(queue.queue, (msg) => {
                                    if (config.save) {
                                        let values = msg.content.toString().split(',');
                                        if (values.length === 7) {
                                            let currentData = {
                                                name: values[0],
                                                domain: values[1],
                                                publicIP: values[2],
                                                location: values[3],
                                                macAddress: values[4],
                                                regionCode: values[5],
                                                countryCode: values[6]
                                            };

                                            DataService.create(
                                                currentData.name,
                                                currentData.domain,
                                                currentData.publicIP,
                                                currentData.location,
                                                currentData.macAddress,
                                                currentData.regionCode,
                                                currentData.countryCode)
                                                .then(() => {

                                                })
                                                .catch((error) => {
                                                    this.logger.error(error);
                                                });
                                        }
                                    }
                                }, {noAck: true});
                            })
                            .catch((error) => {
                                this.logger.error(error);
                            });
                    })
                    .catch((error) => {
                        this.logger.error(error);
                    });
            });
    }

    get port(): Number {
        return this.bindPort || 3000;
    }

    set port(value: Number) {
        this.bindPort = value;
        this.application.express.set('port', this.bindPort);
    }

    get logger(): winston.LoggerInstance {
        return this.appLogger;
    }

    private sendBrowserMessage(message: Message) {
        this.io.sockets.emit('message', message);
    }

    start() {
        this.server.listen(this.bindPort);
        this.server.on('error', (error: any) => {
            this.logger.error(error);
        });

        this.server.on('listening', () => {
            this.logger.info('Listening on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            socket.on('disconnect', () => {
            });
        });
    }
}