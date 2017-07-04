import {Route} from "./Route";
import * as express from "express";

export class ApiRoute extends Route {

    registerRoutes() {
        this._get('/api/users', function (req: express.Request, res: express.Response) {

        });

        this._post('/api/users', function (req: express.Request, res: express.Response) {

        });

        this._get('/api/users/:id', function (req: express.Request, res: express.Response) {

        });

        this._put('/api/users/:id', function (req: express.Request, res: express.Response) {

        });

        this._delete('/api/users/:id', function (req: express.Request, res: express.Response) {

        });
    }
}