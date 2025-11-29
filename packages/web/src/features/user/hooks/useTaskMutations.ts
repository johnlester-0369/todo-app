import { useState, useCallback } from 'react'
import { taskService, type Task } from '@/features/user/services/task.service'
import { isEmpty, sanitizeString } from '@/utils'

/**
 * Task creation input
 */
interface TaskCreateInput {
  title: string
  description: string
}

/**
 * Task update input
 */
interface TaskUpdateInput {
  title?: string
  description?: string
  completed?: boolean
}

/**
 * Hook options for callbacks
 */
interface UseTaskMutationsOptions {
  onSuccess?: (message: string, task?: Task) => void
  onError?: (message: string) => void
}

/**
 * Hook return type
 */
interface UseTaskMutationsReturn {
  isSubmitting: boolean
  createTask: (input: TaskCreateInput) => Promise<Task | null>
  updateTask: (id: string, input: TaskUpdateInput) => Promise<Task | null>
  deleteTask: (id: string) => Promise<boolean>
}

/**
 * Custom hook to handle task mutations (create, update, delete)
 *
 * @example
 * ```tsx
 * const { createTask, updateTask, deleteTask, isSubmitting } = useTaskMutations({
 *   onSuccess: (message) => showSuccessToast(message),
 *   onError: (message) => showErrorToast(message)
 * })
 * ```
 */
export function useTaskMutations(
  options: UseTaskMutationsOptions = {},
): UseTaskMutationsReturn {
  const { onSuccess, onError } = options
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Create a new task
   */
  const createTask = useCallback(
    async (input: TaskCreateInput): Promise<Task | null> => {
      // Validate title
      if (isEmpty(input.title)) {
        onError?.('Task title is required')
        return null
      }

      if (sanitizeString(input.title).length < 3) {
        onError?.('Task title must be at least 3 characters')
        return null
      }

      if (sanitizeString(input.title).length > 100) {
        onError?.('Task title must not exceed 100 characters')
        return null
      }

      // Validate description
      if (isEmpty(input.description)) {
        onError?.('Task description is required')
        return null
      }

      if (sanitizeString(input.description).length < 10) {
        onError?.('Task description must be at least 10 characters')
        return null
      }

      if (sanitizeString(input.description).length > 500) {
        onError?.('Task description must not exceed 500 characters')
        return null
      }

      setIsSubmitting(true)
      try {
        const createdTask = await taskService.createTask({
          title: sanitizeString(input.title),
          description: sanitizeString(input.description),
        })

        onSuccess?.('Task created successfully', createdTask)
        return createdTask
      } catch (err: unknown) {
        console.error('Error creating task:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || 'Failed to create task. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Update an existing task
   */
  const updateTask = useCallback(
    async (id: string, input: TaskUpdateInput): Promise<Task | null> => {
      // Validate title if being updated
      if (input.title !== undefined) {
        if (isEmpty(input.title)) {
          onError?.('Task title cannot be empty')
          return null
        }

        if (sanitizeString(input.title).length < 3) {
          onError?.('Task title must be at least 3 characters')
          return null
        }

        if (sanitizeString(input.title).length > 100) {
          onError?.('Task title must not exceed 100 characters')
          return null
        }
      }

      // Validate description if being updated
      if (input.description !== undefined) {
        if (isEmpty(input.description)) {
          onError?.('Task description cannot be empty')
          return null
        }

        if (sanitizeString(input.description).length < 10) {
          onError?.('Task description must be at least 10 characters')
          return null
        }

        if (sanitizeString(input.description).length > 500) {
          onError?.('Task description must not exceed 500 characters')
          return null
        }
      }

      setIsSubmitting(true)
      try {
        const updatedTask = await taskService.updateTask(id, {
          ...input,
          title:
            input.title !== undefined ? sanitizeString(input.title) : undefined,
          description:
            input.description !== undefined
              ? sanitizeString(input.description)
              : undefined,
        })

        onSuccess?.('Task updated successfully', updatedTask)
        return updatedTask
      } catch (err: unknown) {
        console.error('Error updating task:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || 'Failed to update task. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Delete a task
   */
  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        await taskService.deleteTask(id)
        onSuccess?.('Task deleted successfully')
        return true
      } catch (err: unknown) {
        console.error('Error deleting task:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || 'Failed to delete task. Please try again.'
        onError?.(errorMessage)
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  return {
    isSubmitting,
    createTask,
    updateTask,
    deleteTask,
  }
}
