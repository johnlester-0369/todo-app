import apiClient from '@/lib/api-client'

/**
 * Task interface matching the simple schema
 */
export interface Task {
  id: string
  userId: string
  title: string
  description: string
  completed: boolean
  createdAt: string // ISO string from server
}

/**
 * Task statistics
 */
export interface TaskStats {
  total: number
  active: number
  completed: number
}

/**
 * Task creation input
 */
export interface CreateTaskData {
  title: string
  description: string
}

/**
 * Task update input (partial updates allowed)
 */
export interface UpdateTaskData {
  title?: string
  description?: string
  completed?: boolean
}

/**
 * Query parameters for fetching tasks
 */
export interface GetTasksParams {
  search?: string
  completed?: boolean
}

/**
 * Task Service - API client for task operations
 */
class TaskService {
  private readonly baseUrl = '/api/v1/user/tasks'

  /**
   * Get all tasks with optional filters
   */
  async getTasks(
    params?: GetTasksParams,
    signal?: AbortSignal,
  ): Promise<Task[]> {
    try {
      const response = await apiClient.get<{ tasks: Task[] }>(this.baseUrl, {
        params,
        signal,
      })
      return response.data.tasks
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      throw error
    }
  }

  /**
   * Get single task by ID
   */
  async getTaskById(id: string, signal?: AbortSignal): Promise<Task> {
    try {
      const response = await apiClient.get<Task>(`${this.baseUrl}/${id}`, {
        signal,
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch task:', error)
      throw error
    }
  }

  /**
   * Create new task
   */
  async createTask(data: CreateTaskData): Promise<Task> {
    try {
      const response = await apiClient.post<Task>(this.baseUrl, data)
      return response.data
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  }

  /**
   * Update task
   */
  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    try {
      const response = await apiClient.put<Task>(`${this.baseUrl}/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStats(signal?: AbortSignal): Promise<TaskStats> {
    try {
      const response = await apiClient.get<TaskStats>(`${this.baseUrl}/stats`, {
        signal,
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch task stats:', error)
      throw error
    }
  }
}

// Export singleton instance
export const taskService = new TaskService()
