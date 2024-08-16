import RolesService from "../components/roles/roles_service";
import Roles from "../components/roles/roles_model";
import { RolesUtil } from "../components/roles/roles_controller";
import { v4 } from "uuid";
import UsersService from "../components/users/users_service";
import Users from "../components/users/users_model";
import * as config from  "../../config.json";
import { encryptString, DEFAULT_ROLES } from './common';



export class DBUtil {
  private static superAdminRoleID: string;

  public static async addDefaultRoles(): Promise<boolean> {
    const roleService = new RolesService();

    try {
      const defaultRoles = DEFAULT_ROLES;
      const existingRoles = await roleService.findAll({});
      for (const role of defaultRoles) {
        const existingRole = existingRoles.data.find((r) => r.name === role.name);
        const newRole: Roles = {
          role_id: v4(),
          name: role.name,
          description: role.description,
          permissions: role.permissions.join(","),
          created_at: new Date(),
          updated_at: new Date(),
        };

        if (existingRole) {
          if (existingRole.permissions !== newRole.permissions) {
            await roleService.update(existingRole.role_id, newRole);
            console.log(`Updated role ${existingRole.name}`);
          }
        } else {
          const result = await roleService.create(newRole);
          console.log(`Added role ${result.data.name}`);
          if (result.statusCode === 201 && role.name === "SuperAdmin") {
            this.superAdminRoleID = result.data.role_id;
          }
        }
      }
      return true;
    } catch (error) {
      console.error(`Error adding default roles: ${error.message}`);
      return false;
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
        role_id: this.superAdminRoleID,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const existingUser = await service.findAll({username: "SuperAdmin"});
      if (!existingUser) {
        const result = await service.create(user);
        console.log("Added super Admin User", result);
        if (result.statusCode === 201) {
          return true;
        }
      };
      console.log("Default user Added already.")
      return false;
    } catch (error) {
      console.error(`Error Adding default user ${error.message}`);
      return false;
    }
  }
}
