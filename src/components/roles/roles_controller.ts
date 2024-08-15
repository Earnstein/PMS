import { Request, Response } from "express";
import { PERMISSIONS } from "../../utils/common";
import Roles from "./roles_model";
import RolesService from "./roles_service";

export class RolesUtil {
  /**
   * Retrieves all possible permissions from the defined permissions object.
   * 
   * @returns {string[]} - An array of all possible permissions.
   */
  public static getAllRightsFromPermissions(): string[] {
    let permissions = [];
    for (const modules in PERMISSIONS) {
      if (PERMISSIONS[modules]["ALL"]) {
        let sectionValues = PERMISSIONS[modules]["ALL"].split(",");
        permissions.push(...sectionValues);
      }
    }
    return permissions;
  }

  /**
   * Retrieves all possible permissions from the roles with the provided IDs.
   *
   * @param {string[]} role_ids - An array of IDs of the roles to retrieve permissions from.
   * @return {Promise<string[]>} An array of all possible permissions from the roles.
   */
  public static async getAllPermissionsFromRoles(role_ids: string[]): Promise<string[]> {
    const service = new RolesService();
    let rolePermissions: string[] = [];

    const queryData = await service.findByIds(role_ids);
    const roles: Roles[] = queryData.data ? queryData.data : [];
    console.log(roles, "roles here".bgMagenta);
    roles.forEach((role) => {
      const permissionFromRole: string[] = role?.permissions?.split(',');
      rolePermissions = [...new Set(rolePermissions.concat(permissionFromRole))];
    });

    console.log(rolePermissions, "rolePermissions here".bgMagenta);

    return rolePermissions;
  }

/**
 * Checks if all the given role IDs are valid.
 *
 * @param {string[]} role_ids - An array of role IDs to be checked.
 * @return {Promise<boolean>} A promise that resolves to a boolean indicating if all the role IDs are valid.
 */
  public static async checkValidPermissions(role_ids: string[]): Promise<boolean> {
    const service = new RolesService();
    const roles = await service.findByIds(role_ids);
    return roles.data.length === role_ids.length;
  }
}

class RoleController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    const role = req.body;
    const service = new RolesService();
    const result = await service.create(role);
    res.status(result.statusCode).json(result);
    return;
  }

  public async getAllHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.findAll(req.query);
    res.status(result.statusCode).json(result);
    return;
  }

  public async getDetailsHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.findOne(req.params.id)
    res.status(result.statusCode).json(result);
    return;

  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.update(req.params.id, req.body);
    res.status(result.statusCode).json(result);
    return;
  }

  public async deleteHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.delete(req.params.id);
    res.status(result.statusCode).json(result)
  }
}

export default RoleController;
