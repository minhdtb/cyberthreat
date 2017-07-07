import {Route} from "./Route";
import * as express from "express";
import DataService from "../services/DataService";

export class ApiRoute extends Route {

    registerRoutes() {
        this._get('/api/get-location', (req: express.Request, res: express.Response) => {
            let ip = req.query.ip;
            if (!ip)
                ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'][0] : null || req.connection.remoteAddress;

            DataService.getInstance().getIpLocation(ip).then((result) => {
                res.send(result);
            });
        });
    }
}