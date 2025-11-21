import type { Request, Response } from 'express';
import { taskRepo } from '@/repos/task.repo.js';
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from '@/models/task.model.js';
import { toTaskResponse } from '@/models/task.model.js';
import { logger } from '@/utils/logger.js';

/**
 * Task Controller - HTTP request handlers
 */

/**
 * Get all tasks for authenticated user with optional filters
 * GET /api/v1/user/tasks?completed=true&search=keyword
 */
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Parse query parameters
    const completedParam = req.query.completed as string | undefined;
    const searchParam = req.query.search as string | undefined;

    // Build filter options (only include properties when they have values)
    const filterOptions: {
      userId: string;
      completed?: boolean;
      search?: string;
    } = { userId };

    // Only add completed filter if explicitly set
    if (completedParam !== undefined) {
      filterOptions.completed = completedParam === 'true';
    }

    // Only add search filter if provided
    if (searchParam !== undefined) {
      filterOptions.search = searchParam;
    }

    const tasks = await taskRepo.findMany(filterOptions);

    // Convert to client-safe response
    const response = tasks.map(toTaskResponse);

    res.json({ tasks: response });
  } catch (error) {
    logger.error('Error fetching tasks', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });

    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

/**
 * Get single task by ID
 * GET /api/v1/user/tasks/:id
 */
export const getTaskById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;

    // Validate taskId exists
    if (!taskId) {
      res.status(400).json({ error: 'Task ID is required' });
      return;
    }

    const task = await taskRepo.findById(taskId, userId);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(toTaskResponse(task));
  } catch (error) {
    logger.error('Error fetching task', {
      error: error instanceof Error ? error.message : String(error),
      taskId: req.params.id,
      userId: req.user?.id,
    });

    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

/**
 * Create new task
 * POST /api/v1/user/tasks
 */
export const createTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const input: CreateTaskInput = req.body;

    // Validate input
    if (!input.title || input.title.trim().length === 0) {
      res.status(400).json({ error: 'Task title is required' });
      return;
    }

    if (input.title.trim().length < 3) {
      res
        .status(400)
        .json({ error: 'Task title must be at least 3 characters' });
      return;
    }

    if (input.title.trim().length > 100) {
      res
        .status(400)
        .json({ error: 'Task title must not exceed 100 characters' });
      return;
    }

    if (!input.description || input.description.trim().length === 0) {
      res.status(400).json({ error: 'Task description is required' });
      return;
    }

    if (input.description.trim().length < 10) {
      res
        .status(400)
        .json({ error: 'Task description must be at least 10 characters' });
      return;
    }

    if (input.description.trim().length > 500) {
      res
        .status(400)
        .json({ error: 'Task description must not exceed 500 characters' });
      return;
    }

    const task = await taskRepo.create(userId, input);

    logger.info('Task created', {
      taskId: task._id?.toString(),
      userId,
    });

    res.status(201).json(toTaskResponse(task));
  } catch (error) {
    logger.error('Error creating task', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });

    res.status(500).json({ error: 'Failed to create task' });
  }
};

/**
 * Update task
 * PUT /api/v1/user/tasks/:id
 */
export const updateTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;
    const input: UpdateTaskInput = req.body;

    // Validate taskId exists
    if (!taskId) {
      res.status(400).json({ error: 'Task ID is required' });
      return;
    }

    // Validate input if title is being updated
    if (input.title !== undefined) {
      if (input.title.trim().length === 0) {
        res.status(400).json({ error: 'Task title cannot be empty' });
        return;
      }

      if (input.title.trim().length < 3) {
        res
          .status(400)
          .json({ error: 'Task title must be at least 3 characters' });
        return;
      }

      if (input.title.trim().length > 100) {
        res
          .status(400)
          .json({ error: 'Task title must not exceed 100 characters' });
        return;
      }
    }

    // Validate description if being updated
    if (input.description !== undefined) {
      if (input.description.trim().length === 0) {
        res.status(400).json({ error: 'Task description cannot be empty' });
        return;
      }

      if (input.description.trim().length < 10) {
        res
          .status(400)
          .json({ error: 'Task description must be at least 10 characters' });
        return;
      }

      if (input.description.trim().length > 500) {
        res
          .status(400)
          .json({
            error: 'Task description must not exceed 500 characters',
          });
        return;
      }
    }

    const task = await taskRepo.update(taskId, userId, input);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    logger.info('Task updated', {
      taskId,
      userId,
    });

    res.json(toTaskResponse(task));
  } catch (error) {
    logger.error('Error updating task', {
      error: error instanceof Error ? error.message : String(error),
      taskId: req.params.id,
      userId: req.user?.id,
    });

    res.status(500).json({ error: 'Failed to update task' });
  }
};

/**
 * Delete task
 * DELETE /api/v1/user/tasks/:id
 */
export const deleteTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;

    // Validate taskId exists
    if (!taskId) {
      res.status(400).json({ error: 'Task ID is required' });
      return;
    }

    const deleted = await taskRepo.delete(taskId, userId);

    if (!deleted) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    logger.info('Task deleted', {
      taskId,
      userId,
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting task', {
      error: error instanceof Error ? error.message : String(error),
      taskId: req.params.id,
      userId: req.user?.id,
    });

    res.status(500).json({ error: 'Failed to delete task' });
  }
};

/**
 * Get task statistics
 * GET /api/v1/user/tasks/stats
 */
export const getTaskStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const stats = await taskRepo.getStats(userId);

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching task stats', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });

    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
};