import { NextFunction, Request, Response } from "express";
import User from "../entities/User";
import { TOKEN_NAMES } from "../constants";
import { verifyAccess, verifyRefresh, setTokens } from "./Token";

const validateTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get Tokens from Cookies or Headers
  const refreshToken: string | undefined = req.cookies[TOKEN_NAMES.REFRESH]
    ? req.cookies[TOKEN_NAMES.REFRESH]
    : req.headers[TOKEN_NAMES.REFRESH]
    ? req.headers[TOKEN_NAMES.REFRESH]!.toString()
    : undefined;
  const accessToken: string | undefined = req.cookies[TOKEN_NAMES.ACCESS]
    ? req.cookies[TOKEN_NAMES.ACCESS]
    : req.headers[TOKEN_NAMES.ACCESS]
    ? req.headers[TOKEN_NAMES.ACCESS]!.toString()
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

  // Sets New Tokens as Cookies and Headers
  setTokens(res, user);

  // Set UserID
  (req as any).userID = user.id;
  (req as any).role = user.role;

  next();
};

export default validateTokenMiddleware;
