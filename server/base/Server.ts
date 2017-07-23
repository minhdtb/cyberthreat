import * as winston from "winston";

export abstract class Server {

    private logger: winston.LoggerInstance;

    constructor(logger: winston.LoggerInstance) {
        this.logger = logger;
    }

    getLogger(): winston.LoggerInstance {
        return this.logger;
    }

    abstract start();
}