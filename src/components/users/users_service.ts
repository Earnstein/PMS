import BaseService from "../../utils/base_service";
import Users from "./users_model";
import { PMS_DATA_SOURCE } from "../../utils/db";
import { Repository } from "typeorm";

class UsersService extends BaseService<Users> {
    constructor() {
        let userRepository : Repository<Users> | null = null;
        const database = new PMS_DATA_SOURCE();
        userRepository = database.getRepository(Users);
        super(userRepository);
    }
}

export default UsersService;