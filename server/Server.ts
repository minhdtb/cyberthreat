import * as http from "http";
import {Application} from "./Application";
import * as winston from "winston";

export class Server {

    protected application: Application;
    protected server: http.Server;
    private bindPort: Number;
    private appLogger: winston.LoggerInstance;

    constructor(logger: winston.LoggerInstance) {
        this.appLogger = logger;
    }

    get port(): Number {
        return this.bindPort || 3000;
    }

    set port(value: Number) {
        this.bindPort = value;
        if (this.application) {
            this.application.express.set('port', this.bindPort);
        }
    }

    get logger(): winston.LoggerInstance {
        return this.appLogger;
    }

    start() {
        this.server.listen(this.bindPort);
        this.server.on('error', (error: any) => {
            this.logger.error(error);
        });

        this.server.on('listening', () => {
            this.logger.info('Listening on port %s', this.port);
        });
    }
}