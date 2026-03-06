import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };

        // Verify user still exists in DB
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            res.status(401).json({ success: false, message: 'Token invalid – user not found.' });
            return;
        }

        req.user = { id: user.id, email: user.email, role: user.role };
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};
