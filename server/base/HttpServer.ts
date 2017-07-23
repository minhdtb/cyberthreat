import {Server} from "./Server";
import * as http from "http";
import {Application} from "../controllers/Application";
import * as winston from "winston";

export abstract class HttpServer extends Server {
    private httpServer: http.Server;
    private port: Number;

    constructor(application: Application, logger: winston.LoggerInstance) {
        super(logger);

        if (application) {
            this.httpServer = http.createServer(application.getExpress());
        } else {
            this.httpServer = http.createServer();
        }
    }

    getPort(): Number {
        return this.port || 3000;
    }

    setPort(value: Number) {
        this.port = value;
    }

    getHttpServer(): http.Server {
        return this.httpServer;
    }

    start() {
        if (!this.httpServer)
            return;

        this.httpServer.on('error', (error: any) => {
            this.getLogger().error(error);
        });

        this.httpServer.on('listening', () => {
            this.getLogger().info('Listening on port %s', this.port);
        });

        this.httpServer.listen(this.port);
    }
}