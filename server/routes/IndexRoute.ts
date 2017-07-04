import {Route} from "./Route";
import * as express from "express";

export class IndexRoute extends Route {

    registerRoutes() {
        this._all(null, (req: express.Request, res: express.Response) => {
            res.render('index');
        });
    }
}