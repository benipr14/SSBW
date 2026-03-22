import "express";

declare global {
  namespace Express {
    interface Request {
      usuario?: string;
      admin?: boolean;
    }
  }
}

export {};
