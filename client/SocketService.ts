import {Observable} from 'rxjs/Observable'
import {Message} from "./Message";
import * as SocketIO from 'socket.io-client';

let SERVER_URL = 'http://localhost:3001';

export class SocketService {
    private socket;

    constructor() {
        this.initSocket();
    }

    private initSocket(): void {
        this.socket = SocketIO(SERVER_URL);
    }

    public send(message: Message): void {
        this.socket.emit('message', message);
    }

    public get(queue) {
        return new Observable(observer => {
            this.socket.on(queue, (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
    }
}