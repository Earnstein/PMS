import express, { Application } from "express";
import { I_ServerConfig } from "./utils/config";
import * as config from  "../config.json";
import Routes from "./routes/index";

export class ExpressServer {
    private static server = null;
    public server_config: I_ServerConfig = config;

    constructor() {
        const port = this.server_config.port || 5000;
        const app = express();
        app.use(express.urlencoded({extended: false}));
        app.use(express.json());

        app.get("/ping", (req, res) => {
            res.send("pong");
        });

        const routes = new Routes(app);

        if (routes) {
            console.log('Routes connected to server.');
        }

        ExpressServer.server = app.listen(port, () => {
            console.log(`Server running on port ${port} with pid ${process.pid}`);
        });
    }

    public closeServer(): void {
        ExpressServer.server.close(() => {
            console.log("Server closed");
            process.exit(0);
        });
    }
}