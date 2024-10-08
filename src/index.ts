import cluster from "cluster";
import * as os from "os";
import { ExpressServer } from "./app";
import "colorts/lib/string";
import { PMS_DATA_SOURCE } from "./utils/db";
import "reflect-metadata";
import { DBUtil } from "./utils/db_utils";

const NUM_CPUs = os.cpus().length;
const args = process.argv.slice(2);

function StartServer() {
  if (cluster.isPrimary) {
    console.log(`Primary worker with pid ${process.pid} is running`.green.underline);

    if (args.length > 0 && args[0] === "--init") {
      (async () => {
        await PMS_DATA_SOURCE.getInstance();
        await DBUtil.addDefaultRoles();
        await DBUtil.addDefaultUser();
        process.exit(0);
      })();
    } else {
      for (let i = 0; i < NUM_CPUs; i++) {
        cluster.fork();
      }

      cluster.on("exit", (worker, code: number, signal: string) => {
        console.log(
          `worker ${worker.process.pid} died with code ${code} and signal ${signal}`
            .red
        );
        setTimeout(() => cluster.fork(), 1000);
      });
    }
  } else {
    const server = new ExpressServer();
    new PMS_DATA_SOURCE();

    process.on("uncaughtException", (error: Error) => {
      console.error(
        `uncaught exception in worker ${process.pid} with error ${error.message}`
          .red.underline
      );
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
