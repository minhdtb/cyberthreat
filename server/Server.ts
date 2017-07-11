import * as http from "http";
import {Application} from "./Application";
import * as SocketIO from "socket.io";
import * as AMQP from "amqplib";
import {Message} from "../client/Message";
import DataService from "./services/DataService";
import * as winston from "winston";
const config = require('../../config.json');
const EXCHANGE_NAME = 'message';

type ConsumerCallback = (msg) => void;

class RData {
    public name: string;
    public domain: string;
    public publicIP: string;
    public location: string;
    public remoteHost: string;
    public macAddress: string;
    public regionCode: string;
    public countryCode: string;
}

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

        this.consume('amqp://localhost', msg => {
            let currentData = Server.getRawData(msg);
            if (currentData) {
                this.sendBrowserMessage({
                    id: 0,
                    location: currentData.location,
                    remoteHost: currentData.remoteHost,
                    regionCode: currentData.regionCode,
                    countryCode: currentData.countryCode,
                    name: currentData.name
                });
            }
        });

        this.consume('amqp://localhost', msg => {
            let currentData = Server.getRawData(msg);
            if (currentData) {
                DataService.getInstance().checkBlackList(currentData.remoteHost)
                    .then((value) => {
                        if (value)
                            this.sendBrowserBlackList({
                                id: 0,
                                location: currentData.location,
                                remoteHost: currentData.remoteHost,
                                regionCode: currentData.regionCode,
                                countryCode: currentData.countryCode,
                                name: currentData.name
                            });
                    })
                    .catch((error) => {
                        this.logger.error(error);
                    });
            }
        });

        this.consume('amqp://localhost', msg => {
            if (config.save) {
                let currentData = Server.getRawData(msg);
                if (currentData) {
                    DataService.getInstance().insertRawData(
                        currentData.name,
                        currentData.domain,
                        currentData.publicIP,
                        currentData.location,
                        currentData.remoteHost,
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
        })
    }

    private consume(uri, callback: ConsumerCallback): void {
        AMQP.connect(uri)
            .then((connection) => {
                connection
                    .createChannel()
                    .then((channel) => {
                        channel.assertExchange(EXCHANGE_NAME, 'fanout', {durable: false});
                        channel.assertQueue('', {exclusive: true})
                            .then((queue) => {
                                channel.bindQueue(queue.queue, EXCHANGE_NAME, '');

                                channel.consume(queue.queue, (msg) => {
                                    callback(msg);
                                });
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

    private static getRawData(msg): RData {
        return JSON.parse(msg.content.toString());
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

    private sendBrowserBlackList(message: Message) {
        this.io.sockets.emit('blacklist', message);
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