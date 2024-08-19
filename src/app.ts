import express, { Request, Response, NextFunction } from "express";
import { I_ServerConfig } from "./utils/config";
import * as config from "../config.json";
import Routes from "./routes/index";
import { StatusCodes } from "http-status-codes";

export class ExpressServer {
  private static server = null;
  public server_config: I_ServerConfig = config;

  constructor() {
    const port = this.server_config.port || 5000;
    const app = express();
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    const routes = new Routes(app);

    if (routes) {
      console.log("Routes connected to server.");
    };
    
    app.use("*", (req: Request, res: Response, next: NextFunction) => {
        res.status(StatusCodes.NOT_FOUND).json({
          message: "Route not found",
          statusCode: StatusCodes.NOT_FOUND,
          status: "failed",
        });
        next();
      });
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
