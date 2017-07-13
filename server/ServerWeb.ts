import * as http from "http";
import {Application} from "./Application";
import * as winston from "winston";
import {Server} from "./Server";


export class ServerWeb extends Server {

    constructor(app: Application, logger: winston.LoggerInstance) {
        super(logger);
        this.application = app;
        this.server = http.createServer(this.application.express);
    }
}