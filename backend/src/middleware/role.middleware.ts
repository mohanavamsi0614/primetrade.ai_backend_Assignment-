import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Role guard factory — pass one or more allowed roles.
 * Must be used AFTER the authenticate middleware.
 */
export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated.' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${roles.join(', ')}.`,
            });
            return;
        }
        next();
    };
};
