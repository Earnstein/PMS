import { SERVER_CONST } from "./common";
import * as jwt from "jsonwebtoken";

export type TokenPayload = {
  user_id: string;
};

export class TokenManager {
  /**
   * Generates a JSON Web Token (JWT) based on the provided payload and type.
   *
   * @param {TokenPayload} payload - The payload to be encoded in the token.
   * @param {string} type - The type of token to generate (access or refresh).
   * @return {string} The generated token.
   */
  public static generateToken(payload: TokenPayload, type: string): string {
    const token = jwt.sign(payload, SERVER_CONST.JWTSECRET, {
      expiresIn:
        type === "access"
          ? SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS
          : SERVER_CONST.REFRESH_TOKEN_EXPIRY_TIME_SECONDS,
    });
    return token;
  }

  /**
   * Verifies a given token using the server's secret key.
   *
   * @param {string} token - The token to be verified.
   * @return {TokenPayload} The decoded token payload.
   */
  public static verifyToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, SERVER_CONST.JWTSECRET) as TokenPayload;
    return decoded;
  }
}
