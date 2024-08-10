import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

export interface I_ValidationError {
  type?: string;
  msg?: string;
  path?: string;
  location?: string;
}

export const validate = (validations: Array<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all the validation middleware functions and wait for them to complete
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // If there are validation errors, format them and send a response with a 400 status
    const errorMessages = errors.array().map((error: I_ValidationError) => {
      const obj = {};
      obj[error.path] = error.msg;
      return obj;
    });
    return res.status(400).json({
      statusCode: StatusCodes.BAD_REQUEST,
      status: "failed",
      errors: errorMessages,
    });
  };
};
