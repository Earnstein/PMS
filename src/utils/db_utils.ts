import RolesService from "../components/roles/roles_service";
import Roles from "../components/roles/roles_model";
import { RolesUtil } from "../components/roles/roles_controller";
import { v4 } from "uuid";
import UsersService from "../components/users/users_service";
import Users from "../components/users/users_model";
import * as config from  "../../config.json";
import { encryptString } from "./common";



export class DBUtil {
  private static superAdminRoleID: string;

  public static async addDefaultRoles(): Promise<boolean> {
    try {
      const service = new RolesService();
      const rights = RolesUtil.getAllRightsFromPermissions();
      const role: Roles = {
        role_id: v4(),
        name: "SuperAdmin",
        description: "Admin with all permissions.",
        permissions: rights.join(","),
        created_at: new Date(),
        updated_at: new Date(),
      };
      const result = await service.create(role);
      console.log("Added super Admin Rights", result);
      if (result.statusCode === 201) {
        this.superAdminRoleID = result.data.role_id;
        return true;
      } else if (result.statusCode === 409) {
        const roles = await service.findAll({ name: "SuperAdmin" });
        if (roles.data.length > 0) {
          this.superAdminRoleID = roles.data[0].role_id;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(`Error Adding default role ${error.message}`);
      return false
    }
  }

  public static async addDefaultUser():  Promise<boolean> {
    try {
      const service = new UsersService();
      const password = await encryptString(config.default_user.password);
      const user: Users = {
        user_id: v4(),
        firstname: "Super",
        lastname: "Admin",
        username: "SuperAdmin",
        email: config.default_user.email,
        password: password,
        role: this.superAdminRoleID,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const result = await service.create(user);
      console.log("Added super Admin User", result);
      if (result.statusCode === 201) {
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error Adding default user ${error.message}`);
      return false;
    }
  }
}
