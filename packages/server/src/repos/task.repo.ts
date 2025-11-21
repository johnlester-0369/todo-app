import { Collection, ObjectId, type Filter, type UpdateFilter } from 'mongodb';
import { db } from '@/lib/db.js';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterOptions,
  TaskStats,
} from '@/models/task.model.js';

/**
 * Task Repository - Data access layer for task operations
 */
class TaskRepository {
  private collection: Collection<Task>;

  constructor() {
    this.collection = db.collection<Task>('tasks');
  }

  /**
   * Create a new task
   */
  async create(userId: string, input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      userId,
      title: input.title.trim(),
      description: input.description.trim(),
      completed: false,
      createdAt: new Date(),
    };

    const result = await this.collection.insertOne(task);

    return {
      ...task,
      _id: result.insertedId,
    };
  }

  /**
   * Find tasks with optional filters
   */
  async findMany(options: TaskFilterOptions): Promise<Task[]> {
    const query: Filter<Task> = { userId: options.userId };

    // Filter by completion status
    if (options.completed !== undefined) {
      query.completed = options.completed;
    }

    // Search in title and description
    if (options.search && options.search.trim()) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const tasks = await this.collection
      .find(query)
      .sort({ createdAt: -1 }) // Newest first
      .toArray();

    return tasks;
  }

  /**
   * Find task by ID and user ID (ensures ownership)
   */
  async findById(taskId: string, userId: string): Promise<Task | null> {
    try {
      const objectId = new ObjectId(taskId);
      const task = await this.collection.findOne({
        _id: objectId,
        userId,
      });

      return task;
    } catch {
      // Invalid ObjectId format
      return null;
    }
  }

  /**
   * Update task by ID (ensures ownership)
   */
  async update(
    taskId: string,
    userId: string,
    input: UpdateTaskInput,
  ): Promise<Task | null> {
    try {
      const objectId = new ObjectId(taskId);

      // Build update object (only include provided fields)
      const updateDoc: UpdateFilter<Task> = {};
      if (input.title !== undefined) {
        updateDoc.title = input.title.trim();
      }
      if (input.description !== undefined) {
        updateDoc.description = input.description.trim();
      }
      if (input.completed !== undefined) {
        updateDoc.completed = input.completed;
      }

      // Return null if no updates provided
      if (Object.keys(updateDoc).length === 0) {
        return this.findById(taskId, userId);
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: objectId, userId },
        { $set: updateDoc },
        { returnDocument: 'after' },
      );

      return result || null;
    } catch {
      // Invalid ObjectId format
      return null;
    }
  }

  /**
   * Delete task by ID (ensures ownership)
   */
  async delete(taskId: string, userId: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(taskId);
      const result = await this.collection.deleteOne({
        _id: objectId,
        userId,
      });

      return result.deletedCount === 1;
    } catch {
      // Invalid ObjectId format
      return false;
    }
  }

  /**
   * Get task statistics for a user
   */
  async getStats(userId: string): Promise<TaskStats> {
    const tasks = await this.collection.find({ userId }).toArray();

    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const active = total - completed;

    return {
      total,
      active,
      completed,
    };
  }

  /**
   * Create indexes for better query performance
   * Call this once during application initialization
   */
  async createIndexes(): Promise<void> {
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ userId: 1, completed: 1 });
    await this.collection.createIndex({ userId: 1, createdAt: -1 });
  }
}

// Export singleton instance
export const taskRepo = new TaskRepository();