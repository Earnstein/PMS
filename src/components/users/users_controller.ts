import { Request, Response } from "express";
import UsersService from "./users_service";
import RolesService from "../roles/roles_service";
import { bcryptCompare, encryptString, SERVER_CONST } from "../../utils/common";
import { StatusCodes } from "http-status-codes";
import * as jwt from "jsonwebtoken";
import { TokenManager, TokenPayload } from '../../utils/token_service';

class UserController {
  /**
   * Adds a new user to the system.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} A promise that resolves when the user is added successfully.
   */
  public async addHandler(req: Request, res: Response): Promise<void> {
    try {
      const user = req.body;
      const roleService = new RolesService();
      const userService = new UsersService();
      const role = await roleService.findAll({ name: "Viewer" });
      user.role_id = role.data[0].role_id;
      user.password = await encryptString(user.password);
      const result = await userService.create(user);
      res.status(result.statusCode).json(result);
      return;
    } catch (error) {
      console.error(`Error adding user: ${error.message}`);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: "Internal server error",
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          status: "failed",
        });
      return;
    }
  }

  /**
   * Handles the HTTP request to retrieve all users.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} A promise that resolves when the request is handled successfully.
   */
  public async getAllHandler(req: Request, res: Response): Promise<void> {
    const service = new UsersService();
    const result = await service.findAll(req.query);
    res.status(result.statusCode).json(result);
    return;
  }

  public getDetailsHandler() {}

  public async updateHandler() {}

  public async deleteHandler() {}

  /**
   * Handles user login by verifying the provided email and password.
   * If the credentials are valid, it generates and returns an access token and a refresh token.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} A promise that resolves when the login process is complete.
   */
  public async loginHandler(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const service = new UsersService();
    const existingUser = await service.findAll({ email: email });
    if (existingUser.data.length < 1) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({
          message: "User not found",
          statusCode: StatusCodes.NOT_FOUND,
          status: "failed",
        });
      return;
    }

    const user = existingUser.data[0];
    const isMatch = await bcryptCompare(password, user.password);
    if (!isMatch) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          message: "Password does not match",
          statusCode: StatusCodes.BAD_REQUEST,
          status: "failed",
        });
      return;
    }
    const payload: TokenPayload = {user_id: user.user_id}
    const accessToken: string = TokenManager.generateToken(payload, "access");
    const refreshToken: string = TokenManager.generateToken(payload, "refresh");

    res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        status: "success",
        data: {
            accessToken,
            refreshToken
        }
    })
    return;
  }

  /**
   * Retrieves a new access token from a refresh token.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} A promise that resolves when the access token is generated and sent in the response.
   */
  public async getAccessTokenFromRefreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const decoded = TokenManager.verifyToken(refreshToken);
      const payload = { user_id: decoded.user_id };
      const accessToken = TokenManager.generateToken(payload, "access");
      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        status: "success",
        data: { accessToken },
      });
      return;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          statusCode: StatusCodes.UNAUTHORIZED,
          status: "failed",
          message: "Token expired",
        });
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          statusCode: StatusCodes.UNAUTHORIZED,
          status: "failed",
          message: "Invalid token",
        });
        return;
      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: "failed",
        message: "Internal server error",
      });
      return;
    }
  }
}

export default UserController;
