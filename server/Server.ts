import * as http from "http";
import {Application} from "./Application";
import * as socketIo from "socket.io";

export class Server {

    private io: any;
    private application: Application;
    private server: http.Server;
    private log;
    private bindPort: Number;

    constructor(app: Application) {
        this.application = app;
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

    start() {
        this.server.listen(this.bindPort);
        this.server.on('error', (error) => {
        });

        this.server.on('listening', () => {

        });

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);
            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }
}