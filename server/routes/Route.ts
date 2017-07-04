import * as express from "express";

export abstract class Route {

    private router;

    abstract registerRoutes();

    constructor() {
        this.router = express.Router();
        this.registerRoutes();
        return this.router;
    }

    static success(res: express.Response, data: any = null) {
        if (data) {
            res.send({
                status: true,
                data: data
            });
        } else {
            res.send({
                status: true
            })
        }
    }

    static error(res: express.Response, message: String, code: number = null) {
        if (code) {
            res.status(code);
        }
        res.send({
            status: false,
            message: message
        });
    }

    protected _get(uri: string, func: Function) {
        this.router.get(uri, func);
    }

    protected _post(uri: string, func: Function) {
        this.router.post(uri, func);
    }

    protected _put(uri: string, func: Function) {
        this.router.put(uri, func);
    }

    protected _delete(uri: string, func: Function) {
        this.router.delete(uri, func);
    }

    protected _all(uri: string = null, func: Function) {
        if (uri)
            this.router.use(uri, func);
        else
            this.router.use(func);
    }
}