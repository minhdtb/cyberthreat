import * as http from "http";
import {Application} from "./Application";
import * as winston from "winston";
import * as AMQP from "amqplib";

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

const EXCHANGE_NAME = 'message';

export class Server {

    protected application: Application;
    protected server: http.Server;
    private bindPort: Number;
    private appLogger: winston.LoggerInstance;

    constructor(logger: winston.LoggerInstance) {
        this.appLogger = logger;
    }

    get port(): Number {
        return this.bindPort || 3000;
    }

    set port(value: Number) {
        this.bindPort = value;
        if (this.application) {
            this.application.express.set('port', this.bindPort);
        }
    }

    get logger(): winston.LoggerInstance {
        return this.appLogger;
    }

    start() {
        if (!this.server)
            return;
        
        this.server.on('error', (error: any) => {
            this.logger.error(error);
        });

        this.server.on('listening', () => {
            this.logger.info('Listening on port %s', this.port);
        });

        this.server.listen(this.bindPort);
    }

    static getRawData(msg): RData {
        return JSON.parse(msg.content.toString());
    }

    consume(uri, callback: ConsumerCallback): void {
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
}