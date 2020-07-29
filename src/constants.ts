// Localhost Port Number
export const PORT: number = 4000;

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
