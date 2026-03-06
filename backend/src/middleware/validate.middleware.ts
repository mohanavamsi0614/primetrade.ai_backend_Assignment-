import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Validate req.body against a Zod schema.
 * On failure, returns 400 with field-level error messages.
 */
export const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction): void => {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: result.error.errors.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
                return;
            }
            req.body = result.data;
            next();
        };
