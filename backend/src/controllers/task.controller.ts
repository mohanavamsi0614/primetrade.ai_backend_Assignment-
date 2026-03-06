import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { CreateTaskInput, UpdateTaskInput } from '../validators/task.validator';

export const getAllTasks = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const isAdmin = req.user!.role === 'ADMIN';
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        const where = {
            ...(isAdmin ? {} : { userId: req.user!.id }),
            ...(status ? { status: status as 'TODO' | 'IN_PROGRESS' | 'DONE' } : {}),
        };

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
            }),
            prisma.task.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                tasks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const isAdmin = req.user!.role === 'ADMIN';

        const task = await prisma.task.findUnique({
            where: { id },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found.' });
            return;
        }

        if (!isAdmin && task.userId !== req.user!.id) {
            res.status(403).json({ success: false, message: 'Access denied.' });
            return;
        }

        res.json({ success: true, data: { task } });
    } catch (error) {
        next(error);
    }
};

export const createTask = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { title, description, status } = req.body as CreateTaskInput;

        const task = await prisma.task.create({
            data: { title, description, status, userId: req.user!.id },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully.',
            data: { task },
        });
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const isAdmin = req.user!.role === 'ADMIN';

        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Task not found.' });
            return;
        }

        if (!isAdmin && existing.userId !== req.user!.id) {
            res.status(403).json({ success: false, message: 'Access denied.' });
            return;
        }

        const { title, description, status } = req.body as UpdateTaskInput;
        const task = await prisma.task.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(status && { status }),
            },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        res.json({
            success: true,
            message: 'Task updated successfully.',
            data: { task },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Task not found.' });
            return;
        }

        // Admin can delete any task; user can only delete their own
        const isAdmin = req.user!.role === 'ADMIN';
        if (!isAdmin && existing.userId !== req.user!.id) {
            res.status(403).json({ success: false, message: 'Access denied.' });
            return;
        }

        await prisma.task.delete({ where: { id } });
        res.json({ success: true, message: 'Task deleted successfully.' });
    } catch (error) {
        next(error);
    }
};
