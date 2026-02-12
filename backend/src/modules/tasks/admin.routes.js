const express = require('express');
const router = express.Router();

const { getAllTasks } = require('./tasks.controller');
const { authenticate, requireAdmin } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { taskQuerySchema } = require('./tasks.validation');

router.use(authenticate, requireAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

/**
 * @swagger
 * /api/v1/admin/tasks:
 *   get:
 *     tags: [Admin]
 *     summary: Get all tasks from all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, DONE]
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
 *     responses:
 *       200:
 *         description: All tasks retrieved
 *       403:
 *         description: Admin access required
 */
router.get('/tasks', validate(taskQuerySchema, 'query'), getAllTasks);

module.exports = router;
