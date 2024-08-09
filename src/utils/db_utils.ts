import { DataSource } from "typeorm";

import { I_ServerConfig } from "../utils/config";
import * as config from "../../config.json"

export class PMS_DATA_SOURCE {
    public server_config: I_ServerConfig = config;

    constructor() {
        this.connectDB();
    }

    private async connectDB() {
        try {
            const db_config = this.server_config.db;
            const AppDataSource = new DataSource({
                type: "postgres",
                host: db_config.host,
                port: db_config.port,
                username: db_config.user,
                password: db_config.password,
                database: db_config.database,
                synchronize: true,
                logging: false,
                entities: []
            });
            const connection = await AppDataSource.initialize();
            if (connection.isInitialized){
                console.log("Database connection established!".green.underline);
            }
        } catch (error) {
            console.error("Unable to initialize the database:".red.underline, error);
        }
    }
}