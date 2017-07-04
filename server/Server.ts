import * as http from "http";
import {Application} from "./Application";
import * as socketIo from "socket.io";
import * as AMQP from  "amqplib";
import {Message} from "../client/Message";
import {error} from "util";
import {DataAttributes} from "./models/Data";
import DataService from "./services/DataService";

const EXCHANGE_NAME = 'message';

export class Server {

    private io: any;
    private application: Application;
    private server: http.Server;
    private bindPort: Number;

    private currentData: any;

    constructor(app: Application) {
        this.application = app;
        this.application.server = this;
        this.server = http.createServer(this.application.express);
        this.io = socketIo(this.server);

        AMQP.connect('amqp://localhost').then((connection) => {
            connection
                .createChannel()
                .then((channel) => {
                    channel.assertExchange(EXCHANGE_NAME, 'fanout', {durable: false});
                    channel.assertQueue('', {exclusive: true})
                        .then((queue) => {
                            channel.bindQueue(queue.queue, EXCHANGE_NAME, '');

                            channel.consume(queue.queue, (msg) => {
                                let values = msg.content.toString().split(',');
                                if (values.length === 5) {
                                    this.currentData = {
                                        name: values[0],
                                        domain: values[1],
                                        publicIP: values[2],
                                        location: values[3],
                                        macAddress: values[4]
                                    };

                                    DataService.create(
                                        this.currentData.name,
                                        this.currentData.domain,
                                        this.currentData.publicIP,
                                        this.currentData.location,
                                        this.currentData.macAddress)
                                        .then(() => {
                                            this.sendBrowserMessage({
                                                id: this.currentData.macAddress,
                                                location: this.currentData.location,
                                                name: this.currentData.name
                                            });
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        });
                                }
                            }, {noAck: true});
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                })
                .catch((error) => {
                    console.log(error);
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

    private sendBrowserMessage(message: Message) {
        this.io.sockets.emit('message', message);
    }

    start() {
        this.server.listen(this.bindPort);
        this.server.on('error', (error) => {
            console.log(error);
        });

        this.server.on('listening', () => {
            console.log('Listening on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            socket.on('disconnect', () => {
            });
        });
    }
}