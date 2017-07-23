import {Application} from "./Application";
import * as winston from "winston";
import {HttpServer} from "../base/HttpServer";

export class WebServer extends HttpServer {

    private application: Application;

    constructor(application: Application, logger: winston.LoggerInstance) {
        super(application, logger);
        this.application = application;
        this.application.setServer(this);
    }

    getApplication(): Application {
        return this.application;
    }
}