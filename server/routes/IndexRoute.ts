import {Route} from "./Route";
import * as express from "express";
import * as async from "async";
import DataService from "../services/DataService";

export const LIMIT: number = 10;

export class IndexRoute extends Route {

    registerRoutes() {
        this._get('/', (req: express.Request, res: express.Response) => {
            async.parallel({
                topMalware: (callback) => {
                    DataService.getInstance().getTopMalware(LIMIT)
                        .then(value => {
                            callback(null, value);
                        })
                        .catch((error) => {
                            callback(error);
                        });
                },
                topRegion: (callback) => {
                    DataService.getInstance().getTopRegion(LIMIT)
                        .then(value => {
                            callback(null, value);
                        })
                        .catch((error) => {
                            callback(error);
                        });
                },
                topRemote: (callback) => {
                    DataService.getInstance().getTopRemote(LIMIT)
                        .then(value => {
                            callback(null, value);
                        })
                        .catch((error) => {
                            callback(error);
                        })
                }
            }, function (error, result) {
                if (error) {
                    res.status(500);
                    return res.send('Error: Internal server error.');
                }

                res.render('index', result);
            });
        });

        this._get('/report', (req: express.Request, res: express.Response) => {
            async.parallel({
                malwares: (callback) => {
                    DataService.getInstance().getTopMalware(0)
                        .then(value => {
                            callback(null, value);
                        })
                        .catch((error) => {
                            callback(error);
                        });
                },
                regions: (callback) => {
                    DataService.getInstance().getTopRegion(0)
                        .then(value => {
                            callback(null, value);
                        })
                        .catch((error) => {
                            callback(error);
                        });
                },
                remotes: (callback) => {
                    DataService.getInstance().getTopRemote(0)
                        .then(value => {
                            callback(null, value);
                        })
                        .catch((error) => {
                            callback(error);
                        })
                }
            }, function (error, result) {
                if (error) {
                    res.status(500);
                    return res.send('Error: Internal server error.');
                }

                res.render('report', result);
            });
        });

        this._all(null, (req: express.Request, res: express.Response) => {
            res.status(404);
            res.send('Error: Not found.');
        });
    }
}