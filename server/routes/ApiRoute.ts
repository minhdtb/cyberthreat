import {Route} from "./Route";
import * as express from "express";
import DataService from "../services/DataService";
import {LIMIT} from "./IndexRoute";
import {Channel} from "amqplib/callback_api";

const amqp = require('amqplib/callback_api');

export class ApiRoute extends Route {

    private channel: Channel;

    public init() {
        amqp.connect('amqp://minhdtb:123456@127.0.0.1', (err, conn) => {
            if (err) {
                return;
            }

            conn.createChannel((err, ch) => {
                if (err) {
                    return;
                }

                ch.assertExchange('message', 'fanout', {durable: false});

                this.channel = ch;
            });
        });
    }

    registerRoutes() {
        this._get('/api/get-location', (req: express.Request, res: express.Response) => {
            let ip: string = req.query.ip;
            if (!ip)
                ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'][0] : null
                    || req.connection.remoteAddress;

            DataService.getInstance().getIpLocation(ip)
                .then((result) => {
                    res.send(result);
                })
                .catch(error => {
                    res.status(500);
                    res.send(error);
                });
        });

        this._get('/api/get-region', (req: express.Request, res: express.Response) => {
            let malwareName: string = req.query.name;

            DataService.getInstance().getTopRegion(LIMIT, malwareName)
                .then(value => {
                    res.send(value);
                })
                .catch(error => {
                    res.status(500);
                    res.send(error);
                });
        });

        this._get('/api/get-malware-region', (req: express.Request, res: express.Response) => {
            let countryCode: string = req.query.countryCode;
            let regionCode: string = req.query.regionCode;

            DataService.getInstance().getTopMalware(LIMIT, countryCode, regionCode)
                .then(value => {
                    res.send(value);
                })
                .catch(error => {
                    res.status(500);
                    res.send(error);
                });
        });

        this._get('/api/get-malware-remote', (req: express.Request, res: express.Response) => {
            let remoteHost: string = req.query.remoteHost;

            DataService.getInstance().getTopMalware(LIMIT, null, null, remoteHost)
                .then(value => {
                    res.send(value);
                })
                .catch(error => {
                    res.status(500);
                    res.send(error);
                });
        });

        this._get('/api/generate-list', (req: express.Request, res: express.Response) => {
            let logger = this.application.getServer().getLogger();
            if (logger)
                logger.info('Malware list is generating...');
            DataService.getInstance().generateMalwareList()
                .then(() => {
                    if (logger)
                        logger.info('Malware list generated.');
                    res.send({});
                })
                .catch(error => {
                    res.status(500);
                    res.send(error);
                });
        });

        this._post('/api/detected', (req: express.Request, res: express.Response) => {
            if (this.channel) {
                this.channel.publish('message', '', new Buffer(JSON.stringify(req.body)));
                res.json({
                    success: true
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
    }
}