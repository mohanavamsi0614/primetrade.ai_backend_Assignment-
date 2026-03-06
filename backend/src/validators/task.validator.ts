import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z
        .string({ required_error: 'Title is required' })
        .min(2, 'Title must be at least 2 characters')
        .max(100, 'Title must be at most 100 characters')
        .trim(),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .trim()
        .optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
});

export const updateTaskSchema = z.object({
    title: z
        .string()
        .min(2, 'Title must be at least 2 characters')
        .max(100, 'Title must be at most 100 characters')
        .trim()
        .optional(),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .trim()
        .optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
