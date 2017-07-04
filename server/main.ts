import {Server} from "./Server";
import {Application} from "./Application";

let application = new Application();
let server = new Server(application);
server.port = 3000;
server.start();