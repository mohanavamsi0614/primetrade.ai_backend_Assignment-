import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

/** GET /api/v1/users  – Admin only: list all users */
export const getAllUsers = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: { select: { tasks: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: { users } });
    } catch (error) {
        next(error);
    }
};

/** DELETE /api/v1/users/:id  – Admin only: remove a user */
export const deleteUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        await prisma.user.delete({ where: { id } });
        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        next(error);
    }
};
