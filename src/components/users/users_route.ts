import { Express } from "express";
import UserController from "./users_controller";
import { body, query } from 'express-validator';
import { validate } from '../../utils/validators';


const validUserInput = [
  body('firstname').trim().notEmpty().withMessage('Firstname is required'),
  body('lastname').trim().notEmpty().withMessage('Lastname is required'),
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage("Provide a valid email"),
  body('password')
  .isLength({min:8, max:18}).withMessage("Password must be between 8 and 18 characters")
  .isStrongPassword({minLowercase: 1, minUppercase:1, minNumbers: 1, minSymbols: 1}).withMessage("Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 symbol"),
]

const validateQUery = [
  query('username').optional().isString().withMessage("Provide a valid name"),
]
class UserRoutes {
  private baseEndPoint = "/api/users";

  constructor(app: Express) {
    const controller = new UserController();
    app
      .route(this.baseEndPoint)
      .get(validate(validateQUery),controller.getAllHandler)
      .post(validate(validUserInput), controller.addHandler);

    app
      .route(this.baseEndPoint + "/:id")
      .get(controller.getDetailsHandler)
      .put(controller.updateHandler)
      .delete(controller.deleteHandler);

    app
      .route("/api/login")
      .post(controller.loginHandler)
    
    app.route("/api/refresh_token")
    .post(controller.getAccessTokenFromRefreshToken);
  }
}

export default UserRoutes;