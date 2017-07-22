import {Route} from "./Route";
import * as express from "express";
import DataService from "../services/DataService";
import {LIMIT} from "./IndexRoute";

export class ApiRoute extends Route {

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
            DataService.getInstance().generateMalwareList()
                .then(() => {
                    res.send({});
                })
                .catch(error => {
                    res.status(500);
                    res.send(error);
                });
        });
    }
}