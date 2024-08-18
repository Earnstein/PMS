import { SERVER_CONST } from "./common";
import * as jwt from "jsonwebtoken";

type TokenPayload = {
  user_id: string;
};

export class TokenManager {
  public static generateToken(payload: TokenPayload, type: string): string {
    const token = jwt.sign(payload.user_id, SERVER_CONST.JWTSECRET, {
      expiresIn:
        type === "access"
          ? SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS
          : SERVER_CONST.REFRESH_TOKEN_EXPIRY_TIME_SECONDS,
    });
    return token;
  }

  public static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, SERVER_CONST.JWTSECRET) as TokenPayload;
  }
}
