import * as winston from "winston";
import * as moment from "moment";
import {DatabaseServer} from "../controllers/DatabaseServer";

let logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            filename: 'database.log',
            timestamp: function () {
                return moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS');
            },
            humanReadableUnhandledException: true,
            maxsize: 1024 * 1024 * 10,
            maxFiles: 5,
            json: false
        })
    ]
});

process.on('uncaughtException', function (error: any) {
    logger.error(error);
});

let server = new DatabaseServer(logger);
server.start();

