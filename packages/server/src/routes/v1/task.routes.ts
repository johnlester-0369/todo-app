import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from '@/controllers/task.controller.js';
import { requireUser } from '@/middleware/user.middleware.js';

const router = Router();

/**
 * All task routes require authentication
 */
router.use(requireUser);

/**
 * Task routes
 */
router.get('/stats', getTaskStats); // Must be before /:id to avoid conflict
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;