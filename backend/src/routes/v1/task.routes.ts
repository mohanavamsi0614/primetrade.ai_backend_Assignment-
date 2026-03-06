import { Router } from 'express';
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from '../../controllers/task.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from '../../validators/task.validator';

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks (admin sees all; user sees own)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, DONE]
 *     responses:
 *       200:
 *         description: List of tasks with pagination
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAllTasks);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 */
router.get('/:id', getTaskById);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Fix login bug
 *               description:
 *                 type: string
 *                 example: The login page throws 500 on wrong password
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *                 example: TODO
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createTaskSchema), createTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 */
router.put('/:id', validate(updateTaskSchema), updateTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task (owner or admin)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 */
router.delete('/:id', deleteTask);

export default router;
