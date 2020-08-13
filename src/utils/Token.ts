import { sign, verify } from "jsonwebtoken";
import { JWT_SECRETS } from "../secrets";
import { AuthTokens } from "src/types";

export const createRefreshToken = (userID: number, count: number): string => {
  return sign({ userID, count }, JWT_SECRETS.REFRESH, {
    expiresIn: JWT_SECRETS.REFRESH_EXP
  });
};

export const createAccessToken = (userID: number, role: string): string => {
  return sign({ userID, role }, JWT_SECRETS.ACCESS, {
    expiresIn: JWT_SECRETS.ACCESS_EXP
  });
};

export const createTokens = (
  userID: number,
  role: string,
  count: number
): AuthTokens => {
  const refresh = createRefreshToken(userID, count);
  const access = createAccessToken(userID, role);

  return { refresh, access };
};

export const verifyAccess = (accessToken: string) => {
  return verify(accessToken, JWT_SECRETS.ACCESS);
};

export const verifyRefresh = (refreshToken: string) => {
  return verify(refreshToken, JWT_SECRETS.REFRESH);
};