import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  taskService,
  type Task,
  type TaskStats,
} from '@/features/user/services/task.service'

/**
 * Filter options for fetching tasks
 */
interface UseTasksOptions {
  search?: string
  status?: 'all' | 'active' | 'completed'
}

/**
 * Hook return type
 */
interface UseTasksReturn {
  tasks: Task[]
  stats: TaskStats
  loading: boolean
  error: string | null
  refetch: () => void
  toggleTask: (id: string) => Promise<void>
}

/**
 * Fetch result type for internal use
 */
type FetchResult =
  | { success: true; tasks: Task[]; stats: TaskStats }
  | { success: false; error?: string }

/**
 * Custom hook to fetch and manage tasks with filters and stats
 *
 * Uses derived loading state pattern to avoid synchronous setState in effects,
 * which complies with React best practices and ESLint rules.
 *
 * @example
 * ```tsx
 * const { tasks, stats, loading, error, refetch, toggleTask } = useTasks({
 *   search: 'project',
 *   status: 'active'
 * })
 * ```
 */
export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { search = '', status = 'all' } = options

  // ============================================================================
  // State Management
  // ============================================================================

  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    active: 0,
    completed: 0,
  })
  const [error, setError] = useState<string | null>(null)

  // Counter to force refetches with the same params
  const [refetchCounter, setRefetchCounter] = useState(0)

  // Track which fetch params we've completed (success or error)
  const [completedFetchKey, setCompletedFetchKey] = useState<string | null>(
    null,
  )

  // ============================================================================
  // Derived State
  // ============================================================================

  // Create a stable key for current fetch params including refetch counter
  const fetchKey = useMemo(
    () => `${search}|${status}|${refetchCounter}`,
    [search, status, refetchCounter],
  )

  // Derive loading state: we're loading if current params don't match completed params
  // This avoids calling setLoading() synchronously in effects
  const loading = completedFetchKey !== fetchKey

  // ============================================================================
  // Refs
  // ============================================================================

  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  // ============================================================================
  // Fetch Logic
  // ============================================================================

  /**
   * Perform the actual fetch operation
   * Memoized based on search and status params
   */
  const performFetch = useCallback(
    async (signal: AbortSignal): Promise<FetchResult> => {
      try {
        // Build params for tasks request
        const params: Record<string, string | boolean> = {}
        if (search.trim()) {
          params.search = search.trim()
        }
        if (status !== 'all') {
          params.completed = status === 'completed'
        }

        // Fetch both tasks and stats in parallel
        const [fetchedTasks, fetchedStats] = await Promise.all([
          taskService.getTasks(params, signal),
          taskService.getTaskStats(signal),
        ])

        // Check if request was aborted before returning
        if (signal.aborted) {
          return { success: false }
        }

        return {
          success: true,
          tasks: fetchedTasks,
          stats: fetchedStats,
        }
      } catch (err: unknown) {
        // Ignore aborted requests
        if (
          (err as { isAborted?: boolean }).isAborted ||
          (err as Error).name === 'AbortError'
        ) {
          return { success: false }
        }

        console.error('Failed to fetch data:', err)
        return {
          success: false,
          error: 'Failed to load tasks. Please try again.',
        }
      }
    },
    [search, status],
  )

  // ============================================================================
  // Effect: Fetch data when params change
  // ============================================================================

  useEffect(() => {
    // Cancel any pending requests
    abortControllerRef.current?.abort()

    // Create new abort controller for this fetch cycle
    const controller = new AbortController()
    abortControllerRef.current = controller

    // Capture the fetchKey for this effect cycle
    const currentFetchKey = fetchKey

    // Perform the async fetch (no synchronous setState here!)
    performFetch(controller.signal).then((result) => {
      // Only update state if component is still mounted and request wasn't aborted
      if (!isMountedRef.current || controller.signal.aborted) {
        return
      }

      if (result.success) {
        setTasks(result.tasks)
        setStats(result.stats)
        setError(null)
        setCompletedFetchKey(currentFetchKey)
      } else if (result.error) {
        setError(result.error)
        setCompletedFetchKey(currentFetchKey)
      }
      // If neither success nor error (aborted), don't update completedFetchKey
    })

    // Cleanup: abort pending requests
    return () => {
      controller.abort()
    }
  }, [performFetch, fetchKey])

  // ============================================================================
  // Effect: Track component mount status
  // ============================================================================

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Toggle task completion with optimistic update
   */
  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id)
      if (!task) return

      // Store previous state for potential rollback
      const previousTasks = tasks
      const previousStats = stats

      // Optimistic update for tasks
      const updatedTasks = tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      )
      setTasks(updatedTasks)

      // Optimistic update for stats
      const wasCompleted = task.completed
      setStats((prev) => ({
        total: prev.total,
        active: wasCompleted ? prev.active + 1 : prev.active - 1,
        completed: wasCompleted ? prev.completed - 1 : prev.completed + 1,
      }))

      try {
        // Update on server
        await taskService.updateTask(id, { completed: !task.completed })
      } catch (err) {
        console.error('Error toggling task:', err)

        // Revert optimistic update on error
        if (!isMountedRef.current) return

        setTasks(previousTasks)
        setStats(previousStats)
        setError('Failed to update task. Please try again.')

        // Clear error after a delay
        setTimeout(() => {
          if (isMountedRef.current) {
            setError(null)
          }
        }, 3000)
      }
    },
    [tasks, stats],
  )

  /**
   * Manually trigger a refetch
   * Incrementing the counter changes fetchKey, which:
   * 1. Makes loading=true immediately (derived state)
   * 2. Triggers the effect to run again
   */
  const refetch = useCallback(() => {
    setRefetchCounter((c) => c + 1)
  }, [])

  // ============================================================================
  // Return
  // ============================================================================

  return {
    tasks,
    stats,
    loading,
    error,
    refetch,
    toggleTask,
  }
}
