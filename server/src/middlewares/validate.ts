import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validate = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body });
  if (!result.success) {
    return next(
      ApiError.badRequest(
        'Validation failed',
        result.error.issues.map((i) => ({ path: i.path.map(String).join('.'), message: i.message })),
      ),
    );
  }
  req.body = (result.data as { body: unknown }).body;
  next();
};