import { Router } from 'express';
import { getAllUsers, deleteUser } from '../../controllers/user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

// All user-management routes are admin only
router.use(authenticate, requireRole('ADMIN'));

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (Admin only)
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Forbidden – admin only
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
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
 *         description: User deleted
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: User not found
 */
router.delete('/:id', deleteUser);

export default router;
