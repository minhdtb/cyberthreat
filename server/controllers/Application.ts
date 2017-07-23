import * as express from "express";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as compression from "compression";

import {IndexRoute} from "../routes/IndexRoute";
import {ApiRoute} from "../routes/ApiRoute";
import {Server} from "../base/Server";

const engine = require('ejs-locals');

export class Application {

    private static readonly VIEW_PATH = './server/views/';
    private express: any;
    private server: Server;

    constructor() {
        this.express = express();
        this.express.engine('ejs', engine);
        this.express.set('views', Application.VIEW_PATH);
        this.express.set('view engine', 'ejs');
        this.express.use(express.static('public'));
        this.express.use(compression());
        this.express.use(logger('dev'));
        this.express.use(bodyParser.urlencoded({
            extended: true
        }));
        this.express.use(bodyParser.json());

        this.express.use(cookieParser());
        this.express.use(function (req, res, next) {
            res.locals.active = req.path.split('/')[1];
            next();
        });

        this.express.use(new ApiRoute(this));
        this.express.use(new IndexRoute(this));
    }

    getExpress() {
        return this.express;
    }

    getServer(): Server {
        return this.server;
    }

    setServer(value: Server) {
        this.server = value;
    }
}