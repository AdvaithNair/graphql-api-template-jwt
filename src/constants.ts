// Localhost Port Number
export const PORT: number = 5000;

// Project Name
export const PROJECT_NAME: string = "GraphQL Template";

// Session Age (7 Years)
export const SESSION_AGE: number = 1000 * 60 * 60 * 24 * 365 * 7;

// Redis Prefixes
export enum REDIS_PREFIXES {
  CONFIRM = "User-Confirmation:",
  FORGOT = "Forgot-Password:",
  GENERAL = "General:"
}

// Error Messages
export enum ERROR_MESSAGES {
  GENERAL = "Error",
  UNAUTHORIZED = 'Unauthorized.',
  USER = "Invalid Credentials",
  OAUTH = "Please Sign In With Listed Provider",
  NOT_CONFIRMED = "Email Not Confirmed",
  PASSWORD_EXISTS = "Password Already Exists",
  PASSWORD_URL_EXPIRED = "URL Expired. Try Again.",
  NEW_PASSWORD_IS_SAME = "New Password is the same as Current Password. Try Again."
}
