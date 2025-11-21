import type { ObjectId } from 'mongodb';

/**
 * Task interface matching the simple schema from the static UI
 */
export interface Task {
  _id?: ObjectId;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

/**
 * Task creation input (without generated fields)
 */
export interface CreateTaskInput {
  title: string;
  description: string;
}

/**
 * Task update input (partial updates allowed)
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

/**
 * Task filter options for queries
 */
export interface TaskFilterOptions {
  userId: string;
  completed?: boolean;
  search?: string;
}

/**
 * Task statistics
 */
export interface TaskStats {
  total: number;
  active: number;
  completed: number;
}

/**
 * Client-safe task representation (with string ID)
 */
export interface TaskResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string; // ISO string for JSON serialization
}

/**
 * Convert MongoDB Task document to client-safe response
 */
export function toTaskResponse(task: Task): TaskResponse {
  return {
    id: task._id!.toString(),
    userId: task.userId,
    title: task.title,
    description: task.description,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
  };
}