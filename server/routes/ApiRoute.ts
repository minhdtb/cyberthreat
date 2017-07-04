import {Route} from "./Route";
import * as express from "express";
import DataService from "../services/DataService";

export class ApiRoute extends Route {

    registerRoutes() {
        this._get('/api/insert', (req: express.Request, res: express.Response) => {
            DataService.create('test', 'testDomain', 'testIP', 'testLocation', 'testMac').then(() => {
                res.send({});
            });
        });
    }
}