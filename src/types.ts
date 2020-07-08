import { Request } from "express";

// Context Type
export interface MyContext {
  req: Request;
}

// Email Message Type
export interface EmailMessage {
  subject: string;
  text: string;
}

// Enum for Email Type
export enum EmailType {
  ConfirmAccount,
  ForgotPassword
}

// Redis Prefixes
export interface RedisPrefixes {
  CONFIRM: string;
  FORGOT: string;
  GENERAL: string;
}
