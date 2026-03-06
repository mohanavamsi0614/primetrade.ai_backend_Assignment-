import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

const signToken = (id: string, email: string, role: string): string => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
};

export const register = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, email, password, role } = req.body as RegisterInput;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ success: false, message: 'Email already in use.' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        const token = signToken(user.id, user.email, user.role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            data: { token, user },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body as LoginInput;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }

        const token = signToken(user.id, user.email, user.role);

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
        });
        res.json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
};
