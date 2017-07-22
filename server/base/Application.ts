import * as express from "express";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as compression from "compression";

import {IndexRoute} from "../routes/IndexRoute";
import {ApiRoute} from "../routes/ApiRoute";
import {Server} from "./Server";

const engine = require('ejs-locals');

export class Application {

    private static readonly VIEW_PATH = './server/views/';
    private localExpress: any;
    private _server: Server;

    constructor() {
        this.localExpress = express();
        this.localExpress.engine('ejs', engine);
        this.localExpress.set('views', Application.VIEW_PATH);
        this.localExpress.set('view engine', 'ejs');
        this.localExpress.use(express.static('public'));
        this.localExpress.use(compression());
        this.localExpress.use(logger('dev'));
        this.localExpress.use(bodyParser.urlencoded({
            extended: true
        }));
        this.localExpress.use(bodyParser.json());

        this.localExpress.use(cookieParser());
        this.localExpress.use(function (req, res, next) {
            res.locals.active = req.path.split('/')[1];
            next();
        });

        this.localExpress.use(new ApiRoute(this));
        this.localExpress.use(new IndexRoute(this));
    }

    get express() {
        return this.localExpress;
    }

    get server(): Server {
        return this._server;
    }

    set server(value: Server) {
        this._server = value;
    }
}