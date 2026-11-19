import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validate = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body, params:req.params,query:req.query});
  if (!result.success) {
    return next(
      ApiError.badRequest(
        'Validation failed',
        result.error.issues.map((i) => ({ path: i.path.map(String).join('.'), message: i.message })),
      ),
    );
  }
  const data  = result.data as { body: unknown };
    if(data.body) req.body = data.body;
  next();
};