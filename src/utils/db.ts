import { DataSource, Repository } from "typeorm";
import { I_ServerConfig } from "../utils/config";
import * as config from "../../config.json";
import Projects from "../components/projects/projects_model";
import Roles from "../components/roles/roles_model";
import Tasks from "../components/tasks/tasks_model";
import Users from "../components/users/users_model";
import Comments from "../components/comments/comments_model";

export class PMS_DATA_SOURCE {
  public server_config: I_ServerConfig = config;
  private static connection: DataSource | null = null;
  private repositories: Record<string, Repository<any>> = {};
  private static instance: PMS_DATA_SOURCE;

  constructor() {
    this.connectDB();
  }

  /**
   * Returns a singleton instance of the PMS_DATA_SOURCE class.
   * If an instance doesn't exist, it creates a new one and connects to the database.
   * If an instance already exists, it returns the existing instance.
   * @returns A Promise that resolves to the singleton instance of PMS_DATA_SOURCE.
   */
  public static async getInstance(): Promise<PMS_DATA_SOURCE> {
    // Check if an instance of PMS_DATA_SOURCE already exists
    if (!PMS_DATA_SOURCE.instance) {
      // If no instance exists, create a new one
      PMS_DATA_SOURCE.instance = new PMS_DATA_SOURCE();
      // Connect to the database using the newly created instance
      await PMS_DATA_SOURCE.instance.connectDB();
    }
    // Return the singleton instance of PMS_DATA_SOURCE
    return PMS_DATA_SOURCE.instance;
  }

  /**
   * Establishes a connection to the database using the provided configuration.
   *
   * If a connection already exists, it returns the existing connection.
   * Otherwise, it creates a new connection, initializes the database, and returns the connection.
   *
   * @returns The established database connection
   */
  private async connectDB() {
    try {
      if (PMS_DATA_SOURCE.connection) {
        return PMS_DATA_SOURCE.connection;
      } else {
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
        });
        await AppDataSource.initialize();
        PMS_DATA_SOURCE.connection = AppDataSource;
        console.log("Database connection established!".green.underline);
        return PMS_DATA_SOURCE.connection;
      }
    } catch (error) {
      console.error("Unable to initialize the database:".red.underline, error);
    }
  }

  /**
   * Get the repository for a given entity.
   * @param entity - The entity for which the repository is needed.
   * @returns The repository instance for the entity.
   */
  public getRepository(entity) {
    try {
      // Check if a valid database connection is available
      if (PMS_DATA_SOURCE.connection) {
        const entityName = entity.name;

        // Check if the repository instance already exists, if not, create it
        if (!this.repositories[entityName]) {
          this.repositories[entityName] = PMS_DATA_SOURCE.connection.getRepository(entity);
        }
        return this.repositories[entityName];
      }
      return null;
    } catch (error) {
      console.error(`Error while getRepository => ${error.message}`);
    }
  }
}
