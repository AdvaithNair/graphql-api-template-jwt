import { sign, verify } from "jsonwebtoken";
import { JWT_SECRETS, REFRESH_EXP, ACCESS_EXP } from "../secrets";
import { AuthTokens } from "../types";
import { Response } from "express";
import User from "../entities/User";
import { TOKEN_NAMES } from "../constants";

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

export const createTokensCustom = (
  userID: number,
  role: string,
  count: number
): AuthTokens => {
  const refresh = createRefreshToken(userID, count);
  const access = createAccessToken(userID, role);

  return { refresh, access };
};

export const createTokens = (user: User): AuthTokens => {
  const refresh = createRefreshToken(user.id, user.count);
  const access = createAccessToken(user.id, user.role);

  return { refresh, access };
};

export const setTokens = (res: Response, user: User) => {
  const tokens: AuthTokens = createTokens(user);
  res.cookie(TOKEN_NAMES.REFRESH, tokens.refresh, {
    expires: REFRESH_EXP,
    httpOnly: true
  });
  res.cookie(TOKEN_NAMES.ACCESS, tokens.access, {
    expires: ACCESS_EXP,
    httpOnly: true
  });
  res.set({
    "Access-Control-Expose-Headers": `${TOKEN_NAMES.REFRESH},${TOKEN_NAMES.ACCESS}`,
    refreshToken: tokens.refresh,
    accessToken: tokens.access
  });
};

export const verifyAccess = (accessToken: string) => {
  return verify(accessToken, JWT_SECRETS.ACCESS);
};

export const verifyRefresh = (refreshToken: string) => {
  return verify(refreshToken, JWT_SECRETS.REFRESH);
};
