import { NextFunction, Request, Response } from "express";
import User from "../entities/User";
import { AuthTokens } from "../types";
import { createTokens, verifyAccess, verifyRefresh } from "./Token";

const validateTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get Tokens from Cookies or Headers
  const refreshToken: string | undefined = req.cookies["refresh-token"]
    ? req.cookies["refresh-token"]
    : req.headers["refreshToken"]
    ? req.headers["refreshToken"]!.toString()
    : undefined;
  const accessToken: string | undefined = req.cookies["access-token"]
    ? req.cookies["access-token"]
    : req.headers["accessToken"]
    ? req.headers["accessToken"]!.toString()
    : undefined;


  // If no tokens, proceed
  if (!accessToken && !refreshToken) return next();

  // Validate Access Token
  if (accessToken) {
    try {
      const accessData: any = verifyAccess(accessToken) as any;
      (req as any).userID = accessData.userID;
      return next();
    } catch (error) {
      // TODO: This could be deleted
      if ((error.name = "TokenExpiredError")) {
        console.log("New Token!!!");
      }
    }
  }

  // If no refresh token, proceed
  if (!refreshToken) return next();

  // Validate Refresh Token
  let refreshData: any;
  try {
    refreshData = verifyRefresh(refreshToken) as any;
  } catch {
    return next();
  }

  // Validate Count Checking
  const user = await User.findOne(refreshData.userID);
  if (!user || user.count !== refreshData.count) {
      return next();
  }

  // Provide New Tokens
  const newTokens: AuthTokens = createTokens(user.id, user.role, user.count);

  // Sets Cookies
  res.cookie("refresh-token", newTokens.refresh);
  res.cookie("access-token", newTokens.access);

  // Sets Headers
  res.set({
    "Access-Control-Expose-Headers": "accessToken,refreshToken",
    "accessToken": newTokens.access,
    "refreshToken": newTokens.refresh
  });

  // Set UserID
  (req as any).userID = user.id;

  next();
};

export default validateTokenMiddleware;
