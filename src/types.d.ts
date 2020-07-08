import { Request } from 'express';

// Context Type
export interface MyContext {
  req: Request;
}