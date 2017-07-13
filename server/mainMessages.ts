import {Server} from "./Server";
import {Application} from "./Application";
import * as winston from "winston";
import * as moment from "moment";
import {ServerMessages} from "./ServerMessages";

let logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            level: 'error',
            filename: 'server.log',
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

let application = new Application();
let server = new ServerMessages(logger);
server.port = 3001;
server.start();

