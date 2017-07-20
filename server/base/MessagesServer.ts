import {Server} from "./Server";
import * as winston from "winston";
import * as http from "http";
import * as SocketIO from "socket.io";
import {Message} from "../../client/Message";
import * as AMQP from "amqplib";
import DataService from "../services/DataService";

const config = require('../../../config.json');
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

export class MessagesServer extends Server {

    private isSending: boolean;
    private io: SocketIO.Server;

    constructor(logger: winston.LoggerInstance) {
        super(logger);
        this.application = null;
        this.server = http.createServer();
        this.io = SocketIO(this.server);

        this.consume('amqp://localhost', msg => {
            let currentData = MessagesServer.getRawData(msg);
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
            let currentData = MessagesServer.getRawData(msg);
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
                let currentData = MessagesServer.getRawData(msg);
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
        });
    }

    private static getRawData(msg): RData {
        return JSON.parse(msg.content.toString());
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
                                }, {noAck: false});
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

    private sendBrowserMessage(message: Message) {
        let self = this;

        function checkSending() {
            if (self.isSending) {
                setTimeout(checkSending, 10);
            } else {
                self.isSending = true;
                self.io.sockets.emit('message', message);
                setTimeout(() => {
                    self.isSending = false
                }, 100);
            }
        }

        checkSending();
    }

    private sendBrowserBlackList(message: Message) {
        let self = this;

        function checkSending() {
            if (self.isSending) {
                setTimeout(checkSending, 10);
            } else {
                console.log('sending');
                self.isSending = true;
                self.io.sockets.emit('blacklist', message);
                setTimeout(() => {
                    self.isSending = false
                }, 100);
            }
        }

        checkSending();
    }

    start() {
        super.start();
        this.io.on('connect', (socket: any) => {
            socket.on('disconnect', () => {
            });
        });
    }
}