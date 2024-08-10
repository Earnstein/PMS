import { Request, Response } from "express";
import { PERMISSIONS } from "../../utils/commmon";
import RolesService from "./roles_service";

export class RolesUtil {
  /**
   * Retrieves all possible permissions from the defined permissions object.
   * @returns {string[]} - An array of all possible permissions.
   */
  public static getAllPermissions(): string[] {
    let permissions = [];
    for (const modules in PERMISSIONS) {
      if (PERMISSIONS[modules]["ALL"]) {
        let sectionValues = PERMISSIONS[modules]["ALL"].split(",");
        permissions.push(...sectionValues);
      }
    }
    return permissions;
  }
}

class RoleController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    const role = req.body;
    const service = new RolesService();
    const result = await service.create(role);
    res.status(result.statusCode).json(result);
  }

  public async getAllHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.findAll(req.query);
    res.status(result.statusCode).json(result);
  }

  public async getDetailsHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.findOne(req.params.id)
    res.status(result.statusCode).json(result);

  }

  public async updateHandler() {}

  public async deleteHandler() {}
}

export default RoleController;
