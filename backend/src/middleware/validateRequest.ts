import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as Record<string, any>;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as Record<string, any>;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};