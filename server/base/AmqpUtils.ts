import * as AMQP from "amqplib";

type ConsumerCallback = (msg) => void;

export class RData {
    public name: string;
    public domain: string;
    public publicIP: string;
    public location: string;
    public remoteHost: string;
    public remoteCountryCode: string;
    public macAddress: string;
    public regionCode: string;
    public countryCode: string;
}

const EXCHANGE_NAME = 'message';

export function getRawData(msg): RData {
    return JSON.parse(msg.content.toString());
}

export function consume(uri, callback: ConsumerCallback): void {
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
