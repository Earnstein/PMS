import { StatusCodes } from "http-status-codes";
import { Repository, DeepPartial, FindOneOptions } from "typeorm";

export type UpdateDataKeys<T> = keyof T & keyof DeepPartial<T>;

export interface ApiResponse<T> {
  status: "success" | "failed";
  message?: string;
  data?: T;
  statusCode?: number;
}

class BaseService<T> {
  constructor(private readonly repository: Repository<T>) {}

  /**
   * Creates a new entity using the provided data and saves it to the database.
   * @param entity - The data to create the entity with.
   * @return An ApiResponse with the created entity data on success or a failed message on failure.
   */
  async create(entity: DeepPartial<T>): Promise<ApiResponse<T>> {
    try {
      const createdEntity = await this.repository.create(entity);
      const savedEntity = await this.repository.save(createdEntity);
      return {
        status: "success",
        data: savedEntity,
        statusCode: StatusCodes.CREATED,
      };
    } catch (error) {
      // Check for a unique constraint violation error.
      if (error.code === "23505") {
        return {
          status: "failed",
          message: error.detail,
          statusCode: StatusCodes.CONFLICT,
        };
      } else {
        // Return a failed response with the error message.
        return {
          status: "failed",
          message: error.message,
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
    }
  }

  /**
   * Update an entity with the provided ID and data.
   * @param id - The ID of the entity to update.
   * @param data - The data to update the entity with.
   * @return An ApiResponse with the updated entity data on success or a failed message on failure.
   */
  async update(id: string, data: DeepPartial<T>): Promise<ApiResponse<T> | undefined> {
    try {
      const isExist = await this.findOne(id);
      if (isExist.statusCode === StatusCodes.NOT_FOUND) {
        return isExist;
      }

      const where = {};
      const primaryKey = this.repository.metadata.primaryColumns[0].databaseName;
      where[primaryKey] = id;

      const validColumns = this.repository.metadata.columns.map((column) => column.propertyName);

      // Extract and filter only the valid columns from the data object.
      const updateQuery: any = {};
      const keys = Object.keys(data) as UpdateDataKeys<T>[];
      for (const key of keys) {
        if (data.hasOwnProperty(key) && validColumns.includes(key as string)) {
          updateQuery[key] = data[key];
        }
      }

      //Execute the update query
      const result = await this.repository
        .createQueryBuilder()
        .update()
        .set(updateQuery)
        .where(where)
        .returning("*")
        .execute();

      if (result.affected > 0) {
        return {
          status: "success",
          data: result.raw[0],
          statusCode: StatusCodes.OK,
        };
      } else {
        return {
          status: "failed",
          data: null,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Invalid data",
        };
      }
    } catch (error) {
      return {
        status: "failed",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  /**
   * Finds an entity with the provided ID.
   * @param id - The ID of the entity to find.
   * @return An ApiResponse with the found entity data on success or a failed message on failure.
   */
  async findOne(id: string): Promise<ApiResponse<T> | undefined> {
    try {
      const where = {};
      const primaryKey = this.repository.metadata.primaryColumns[0].databaseName;
      where[primaryKey] = id;

      const options: FindOneOptions<T> = { where: where };

      const data = await this.repository.findOne(options);

      if (!data) {
        return {
          status: "failed",
          statusCode: StatusCodes.NOT_FOUND,
          message: "Not Found",
        };
      }
      return {
        status: "success",
        data: data,
        statusCode: StatusCodes.OK,
      };
    } catch (error) {
      return {
        status: "failed",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  /**
   * Finds all entities based on the provided query parameters.
   * @param queryParams - The query parameters to filter the entities.
   * @returns An ApiResponse with status and an array of retrieved entity data on success or an error message on failure.
   */
  async findAll(queryParams: object): Promise<ApiResponse<T[]>> {
    try {
      let data = [];
      if (Object.keys(queryParams).length > 0) {
        const query = await this.repository.createQueryBuilder();
        for (const field in queryParams) {
          // eslint-disable-next-line no-prototype-builtins
          if (queryParams.hasOwnProperty(field)) {
            const value = queryParams[field];
            query.andWhere(`${field} = '${value}'`);
          }
        }
        data = await query.getMany();
      } else {
        data = await this.repository.find();
      }
      return { statusCode: StatusCodes.OK, status: "success", data: data };
    } catch (error) {
      return {
        statusCode: StatusCodes.INSUFFICIENT_SPACE_ON_RESOURCE,
        status: "failed",
        data: [],
        message: error.message,
      };
    }
  }

  /**
   * Deletes an entity based on the provided ID.
   * @param id - The ID of the entity to be deleted.
   * @returns An ApiResponse with status indicating success or error.
   */
  async delete(id: string): Promise<ApiResponse<T>> {
    try {
      // Check if the entity exists with the provided ID
      const isExist = await this.findOne(id);
      if (isExist.statusCode === 404) {
        return isExist;
      }

      // Delete the entity with the provided ID
      await this.repository.delete(id);

      return { statusCode: StatusCodes.OK, status: "success" };
    } catch (error) {
      return {
        statusCode: StatusCodes.INSUFFICIENT_SPACE_ON_RESOURCE,
        status: "failed",
        message: error.message,
      };
    }
  }

  /**
   * Retrieves multiple records by their IDs from the database.
   *
   * @param {string[]} ids - An array of IDs used to fetch records.
   * @returns {Promise<ApiResponse<T[]>>} - A promise that resolves to an ApiResponse containing the retrieved data.
   */
  async findByIds(ids: string[]): Promise<ApiResponse<T[]>> {
    try {
      const primaryKey: string =
        this.repository.metadata.primaryColumns[0].databaseName;

      const data = await this.repository
        .createQueryBuilder()
        .where(`${primaryKey} IN (:...ids)`, { ids: ids })
        .getMany();

      return { statusCode: StatusCodes.OK, status: "success", data: data };
    } catch (error) {
      return {
        statusCode: StatusCodes.INSUFFICIENT_SPACE_ON_RESOURCE,
        status: "failed",
        data: [],
        message: error.message,
      };
    }
  }

  /**
   * Executes a custom query on the database.
   *
   * @param {string} query - The custom query to be executed.
   * @returns {Promise<T[]>} - A promise that resolves to an array of results from the custom query.
   */
  async customQuery(query: string): Promise<T[]> {
    try {
      const data = await this.repository
        .createQueryBuilder()
        .where(query)
        .getMany();

      return data;
    } catch (error) {
      console.error(`Error while executing custom query: ${query}`, error);
      return [];
    }
  }
}

export default BaseService;
