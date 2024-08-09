import cluster from "cluster";
import * as os from "os";
import { ExpressServer } from "./app";
import "colorts/lib/string";
import { PMS_DATA_SOURCE } from './utils/db_utils';

const numCPUs = navigator?.hardwareConcurrency || os.cpus().length;

function StartServer() {
  if (cluster.isPrimary) {
    console.log(`Primary worker with pid ${process.pid} is running`.green.underline);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code: number, signal: string) => {
      console.log(`worker ${worker.process.pid} died with code ${code} and signal ${signal}`.red);
      setTimeout(() => cluster.fork(), 1000);
    });
  } else {
    const server = new ExpressServer();
    new PMS_DATA_SOURCE();

    process.on("uncaughtException", (error: Error) => {
      console.error(`uncaught exception in worker ${process.pid} with error ${error.message}`.red.underline);
      server.closeServer();
      setTimeout(() => {
        cluster.fork();
        cluster.worker?.disconnect();
      }, 1000);
    });

    process.on("SIGINT", () => {
      console.log("Received SIGINT. Gracefully shutting down.");
      server.closeServer();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("Received SIGTERM. Gracefully shutting down.");
      server.closeServer();
      process.exit(0);
    });
  }
}

StartServer();
