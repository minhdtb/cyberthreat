import {Server} from "./Server";
import * as winston from "winston";
import DataService from "../services/DataService";

const config = require('../../../config.json');

export class DatabaseServer extends Server {

    constructor(logger: winston.LoggerInstance) {
        super(logger);

        this.consume('amqp://localhost', msg => {
            if (config.save) {
                let currentData = DatabaseServer.getRawData(msg);
                if (currentData) {
                    DataService.getInstance().insertRawData(
                        currentData.name,
                        currentData.domain,
                        currentData.publicIP,
                        currentData.location,
                        currentData.remoteHost,
                        currentData.macAddress,
                        currentData.regionCode,
                        currentData.countryCode)
                        .then(() => {
                        })
                        .catch((error) => {
                            this.logger.error(error);
                        });
                }
            }
        });
    }
}