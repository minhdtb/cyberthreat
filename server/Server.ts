import * as http from "http";
import {Application} from "./Application";
import * as socketIo from "socket.io";
import {Message} from "../client/Message";

export class Server {

    private io: any;
    private application: Application;
    private server: http.Server;
    private bindPort: Number;

    constructor(app: Application) {
        this.application = app;
        this.application.server = this;
        this.server = http.createServer(this.application.express);
        this.io = socketIo(this.server);
    }

    get port(): Number {
        return this.bindPort || 3000;
    }

    set port(value: Number) {
        this.bindPort = value;
        this.application.express.set('port', this.bindPort);
    }

    sendMessage(message: Message) {
        this.io.sockets.emit('message', message);
    }

    start() {
        this.server.listen(this.bindPort);
        this.server.on('error', (error) => {
            console.log(error);
        });

        this.server.on('listening', () => {
            console.log('Listening on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            socket.on('disconnect', () => {
            });
        });
    }
}