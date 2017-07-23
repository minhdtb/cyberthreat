import * as winston from "winston";
import * as SocketIO from "socket.io";
import {Message} from "../../client/Message";
import DataService from "../services/DataService";
import {consume, getRawData} from "../base/AmqpUtils";
import {HttpServer} from "../base/HttpServer";

export class MessagesServer extends HttpServer {

    private isSending: boolean;
    private io: SocketIO.Server;

    constructor(logger: winston.LoggerInstance) {
        super(null, logger);
        this.io = SocketIO(this.getHttpServer());

        consume('amqp://localhost', msg => {
            let currentData = getRawData(msg);
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

        consume('amqp://localhost', msg => {
            let currentData = getRawData(msg);
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
                        this.getLogger().error(error);
                    });
            }
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