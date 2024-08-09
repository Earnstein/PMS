import { DataSource } from "typeorm";

import { I_ServerConfig } from "../utils/config";
import * as config from "../../config.json"
import  Projects  from "../components/projects/projects_model";
import  Roles  from '../components/roles/roles_model';
import  Tasks  from "../components/tasks/tasks_model";
import  Users  from '../components/users/users_model';
import Comments from "../components/comments/comments_model";


export class PMS_DATA_SOURCE {
    public server_config: I_ServerConfig = config;

    constructor() {
        this.connectDB();
    }

    private connectDB() {
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
                entities: [Comments, Projects, Roles, Tasks, Users],
                poolSize: 25,
                connectTimeoutMS: 30000,
                uuidExtension: "pgcrypto",
                maxQueryExecutionTime: 5000,

            })
            AppDataSource.initialize()
            .then(() => {
                console.log("Database connection established!".green.underline);
            })
            .catch(() => {
                console.error("Database connection could not be established.".red.underline);
            });
        } catch (error) {
            console.error("Unable to initialize the database:".red.underline, error);
        }
    }
}