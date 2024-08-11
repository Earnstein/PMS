import { Express } from "express";
import RoleController, { RolesUtil } from "./roles_controller";
import { validate } from "../../utils/validators";
import { body, param } from "express-validator";

const validRoleInput = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("description").notEmpty().isLength({ max: 250 }).withMessage("Description must be less than 250 characters"),
  body("permissions").custom((value: string) => {
    const accessPermissions = value.split(",");
    if (accessPermissions.length > 0) {
      const validPermissions = RolesUtil.getAllRightsFromPermissions();
      const areAllPermissionValid = accessPermissions.every((permission) => validPermissions.includes(permission));
      if (!areAllPermissionValid) {
        throw new Error("Invalid permissions");
      }
    }
    return true;
  }).withMessage("permissions is required")
]

const validateId = [
  param("id").isUUID().withMessage("Invalid ID")
]

class RoleRoutes {
  private baseEndPoint = "/api/roles";

  constructor(app: Express) {
    const controller = new RoleController();

    app
      .route(this.baseEndPoint)
      .get(controller.getAllHandler)
      .post(validate(validRoleInput), controller.addHandler);

    app
      .route(this.baseEndPoint + "/:id")
      .get(validate(validateId), controller.getDetailsHandler)
      .put(validate(validateId), validate(validRoleInput), controller.updateHandler)
      .delete(validate(validateId), controller.deleteHandler);
  }
}

export default RoleRoutes;
