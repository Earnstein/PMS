import BaseService from "../../utils/base_service";
import Roles from "./roles_model";
import { PMS_DATA_SOURCE } from "../../utils/db";

class RolesService extends BaseService<Roles> {
    constructor() {
        const database = new PMS_DATA_SOURCE();
        const repository = database.getRepository(Roles);
        super(repository);
    }
}

export default RolesService;