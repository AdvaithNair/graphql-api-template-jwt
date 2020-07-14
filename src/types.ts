import { Request, Response } from "express";
import { Stream } from "stream";

// Context Type
export interface MyContext {
  req: Request;
  res: Response;
}

// Image Upload Type
export interface UploadImage {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
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