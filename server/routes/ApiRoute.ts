import {Route} from "./Route";
import * as express from "express";
import DataService from "../services/DataService";

export class ApiRoute extends Route {

    registerRoutes() {
        this._get('/api/get-location', (req: express.Request, res: express.Response) => {
            let ip = req.query.ip;
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
            let malwareName = req.query.name;

            DataService.getInstance().getTopRegion(malwareName)
                .then(value => {
                    res.send(value);
                })
                .catch(error => {
                    res.status(500);
                    res.send(error);
                });
        });

        this._get('/api/get-malware-region', (req: express.Request, res: express.Response) => {
            let countryCode = req.query.countryCode;
            let regionCode = req.query.regionCode;

            DataService.getInstance().getTopMalware(countryCode, regionCode)
                .then(value => {
                    res.send(value);
                })
                .catch(error => {
                    res.status(500);
                    res.send(error);
                });
        });

        this._get('/api/get-malware-remote', (req: express.Request, res: express.Response) => {
            let remoteHost = req.query.remoteHost;

            DataService.getInstance().getTopMalware(null, null, remoteHost)
                .then(value => {
                    res.send(value);
                })
                .catch(error => {
                    res.status(500);
                    res.send(error);
                });
        });
    }
}