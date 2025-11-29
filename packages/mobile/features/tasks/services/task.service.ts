import apiClient from '@/lib/api-client'

// ============================================================================
// Types
// ============================================================================

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface TaskStats {
  total: number
  active: number
  completed: number
}

export interface CreateTaskInput {
  title: string
  description: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  completed?: boolean
}

// ============================================================================
// Task Service
// ============================================================================

/**
 * Task Service
 *
 * Provides CRUD operations for tasks using the API client.
 * All methods include proper error handling and type safety.
 *
 * API Response Formats (matching backend):
 * - GET /tasks → { tasks: Task[] }
 * - GET /tasks/:id → Task (directly, not wrapped)
 * - GET /tasks/stats → TaskStats
 * - POST /tasks → Task
 * - PATCH /tasks/:id → Task
 * - DELETE /tasks/:id → void
 */
export const taskService = {
  /**
   * Get all tasks with optional filters
   */
  async getTasks(
    params?: Record<string, string | boolean>,
    signal?: AbortSignal,
  ): Promise<Task[]> {
    const queryParams = params
      ? Object.entries(params)
          .filter(([, value]) => value !== undefined && value !== '')
          .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
          .join('&')
      : ''

    const endpoint = queryParams
      ? `/api/v1/user/tasks?${queryParams}`
      : '/api/v1/user/tasks'
    const response = await apiClient.get<{ tasks: Task[] }>(endpoint, {
      signal,
    })
    return response.data.tasks
  },

  /**
   * Get a single task by ID
   *
   * NOTE: API returns Task directly, not wrapped in { task: Task }
   */
  async getTaskById(id: string, signal?: AbortSignal): Promise<Task> {
    const response = await apiClient.get<Task>(`/api/v1/user/tasks/${id}`, {
      signal,
    })
    return response.data
  },

  /**
   * Get task statistics
   */
  async getTaskStats(signal?: AbortSignal): Promise<TaskStats> {
    const response = await apiClient.get<TaskStats>(
      `/api/v1/user/tasks/stats`,
      { signal },
    )
    return response.data
  },

  /**
   * Create a new task
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    const response = await apiClient.post<Task>('/api/v1/user/tasks', input)
    return response.data
  },

  /**
   * Update an existing task
   */
  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const response = await apiClient.put<Task>(
      `/api/v1/user/tasks/${id}`,
      input,
    )
    return response.data
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/user/tasks/${id}`)
  },
}

export default taskService
