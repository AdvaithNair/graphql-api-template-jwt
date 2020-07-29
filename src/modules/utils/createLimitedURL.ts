import { v4 } from "uuid";
import redis from "../../redis";
import { FRONTEND_URL } from "../../secrets";
import { REDIS_PREFIXES } from "../../constants";
import { EmailType } from "../../types";

const URL_EXPIRATION: number = 60 * 60 * 24; // Expires in 1 Day

// Determines Redis Prefix Depending On Email Type
const setPrefix = (emailType: EmailType): string => {
  switch (emailType) {
    case EmailType.ConfirmAccount:
      return REDIS_PREFIXES.CONFIRM;
    case EmailType.ForgotPassword:
      return REDIS_PREFIXES.FORGOT;
    default:
      return REDIS_PREFIXES.GENERAL;
  }
};

const createLimitedURL = async (
  userID: number,
  path: string,
  emailType: EmailType
) => {
  const token: string = v4();
  const redisPrefix = setPrefix(emailType);
  await redis.set(redisPrefix + token, userID, "ex", URL_EXPIRATION);

  return FRONTEND_URL + path + token;
};

export default createLimitedURL;
