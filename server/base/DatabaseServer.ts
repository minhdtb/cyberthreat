import {Server} from "./Server";
import * as winston from "winston";
import * as cron from "cron";

import DataService from "../services/DataService";

const config = require('../../../config.json');

export class DatabaseServer extends Server {

    constructor(logger: winston.LoggerInstance) {
        super(logger);

        let job = new cron.CronJob('*/5 * * * *', function () {
            DataService.getInstance().generateMalwareList()
                .then(() => {
                    logger.info('Malware list generated.')
                })
                .catch(error => {
                    logger.error(error);
                });
        }, null, false, 'Asia/Ho_Chi_Minh');

        job.start();
        
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