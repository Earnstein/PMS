import { Repository } from "typeorm";
import BaseService from "../../utils/base_service";
import { StatusCodes } from "http-status-codes";
import Roles from "./roles_model";
import { PMS_DATA_SOURCE } from "../../utils/db_utils";

class RolesService extends BaseService<Roles> {
    constructor() {
        const database = new PMS_DATA_SOURCE();
        const repository = database.getRepository(Roles);
        super(repository);
    }
}

export default RolesService;