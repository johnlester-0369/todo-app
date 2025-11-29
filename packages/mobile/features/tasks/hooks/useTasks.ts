import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { taskService, type Task, type TaskStats } from '@/features/tasks/services/task.service'
import { useUserAuth } from '@/contexts/UserAuthContext'

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
 * Default empty stats to avoid creating new objects on each render
 */
const EMPTY_STATS: TaskStats = {
  total: 0,
  active: 0,
  completed: 0,
}

/**
 * Custom hook to fetch and manage tasks with filters and stats
 *
 * CRITICAL: This hook checks authentication state before making any API calls.
 * This prevents 401 errors during logout when the session has been cleared
 * but the component is still mounted.
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

  // Get auth state - CRITICAL for preventing API calls during logout
  const {
    isAuthenticated,
    isLoading: authLoading,
    isLoggingOut,
  } = useUserAuth()

  // Compute whether we can safely make API calls
  // - Must be authenticated
  // - Auth must not be loading (initial app load)
  // - Must not be in the process of logging out
  const canFetch = useMemo(() => {
    return isAuthenticated && !authLoading && !isLoggingOut
  }, [isAuthenticated, authLoading, isLoggingOut])

  // State - Initialize loading as true since we fetch on mount
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  /**
   * Fetch tasks and stats together (single request cycle)
   * Returns null if request was aborted or component unmounted
   */
  const performFetch = useCallback(
    async (signal: AbortSignal) => {
      // Double-check we can fetch (in case canFetch changed during async operations)
      if (!canFetch) {
        return { success: false as const, reason: 'not-authenticated' }
      }

      try {
        // Build params for tasks request
        const params: Record<string, string | boolean> = {}
        if (search.trim()) {
          params.search = search.trim()
        }
        if (status !== 'all') {
          params.completed = status === 'completed'
        }

        // Fetch both tasks and stats in parallel with same abort signal
        const [fetchedTasks, fetchedStats] = await Promise.all([
          taskService.getTasks(params, signal),
          taskService.getTaskStats(signal),
        ])

        // Check if request was aborted before updating state
        if (signal.aborted || !isMountedRef.current) {
          return { success: false as const, reason: 'aborted' }
        }

        return {
          success: true as const,
          tasks: fetchedTasks,
          stats: fetchedStats,
        }
      } catch (err: unknown) {
        // Ignore aborted requests
        if (
          (err as { isAborted?: boolean }).isAborted ||
          (err as Error).name === 'AbortError'
        ) {
          return { success: false as const, reason: 'aborted' }
        }

        // Don't log errors if we're logging out - this is expected
        if (!isLoggingOut) {
          console.error('Failed to fetch data:', err)
        }

        return {
          success: false as const,
          reason: 'error',
          error: 'Failed to load tasks. Please try again.',
        }
      }
    },
    [search, status, canFetch, isLoggingOut],
  )

  /**
   * Effect to fetch data when dependencies change
   */
  useEffect(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // If we can't fetch, reset state and stop
    if (!canFetch) {
      setLoading(false)
      // Only clear data if we're logging out (not during initial auth loading)
      if (isLoggingOut) {
        setTasks([])
        setStats(EMPTY_STATS)
        setError(null)
      }
      return
    }

    // Create new abort controller for this fetch cycle
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // Set loading state before fetch
    setLoading(true)
    setError(null)

    // Perform the async fetch
    performFetch(abortController.signal).then((result) => {
      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      if (result.success) {
        setTasks(result.tasks)
        setStats(result.stats)
        setLoading(false)
        setError(null)
      } else if (result.reason === 'error' && 'error' in result) {
        setError(result.error ?? null)
        setLoading(false)
      } else {
        // Aborted or not authenticated - just stop loading
        setLoading(false)
      }
    })

    // Cleanup: abort pending requests on unmount or when effect re-runs
    return () => {
      abortController.abort()
    }
  }, [performFetch, canFetch, isLoggingOut])

  /**
   * Cleanup effect to track component mount status
   */
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /**
   * Toggle task completion with optimistic update
   */
  const toggleTask = useCallback(
    async (id: string) => {
      // Don't allow toggles if not authenticated or logging out
      if (!canFetch) {
        console.log('⚠️ Cannot toggle task: not authenticated or logging out')
        return
      }

      try {
        const task = tasks.find((t) => t.id === id)
        if (!task) return

        // Optimistic update
        const updatedTasks = tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t,
        )
        setTasks(updatedTasks)

        // Update stats optimistically
        const wasCompleted = task.completed
        setStats((prev) => ({
          total: prev.total,
          active: wasCompleted ? prev.active + 1 : prev.active - 1,
          completed: wasCompleted ? prev.completed - 1 : prev.completed + 1,
        }))

        // Update on server
        await taskService.updateTask(id, { completed: !task.completed })
      } catch (err) {
        // Don't log or revert if logging out
        if (isLoggingOut) return

        console.error('Error toggling task:', err)

        // Revert optimistic update by triggering re-fetch
        if (!isMountedRef.current || !canFetch) return

        const controller = new AbortController()

        // Set loading state before reverting
        setLoading(true)
        setError(null)

        // Perform fetch and update state in callback
        performFetch(controller.signal).then((result) => {
          if (!isMountedRef.current) return

          if (result.success) {
            setTasks(result.tasks)
            setStats(result.stats)
            setLoading(false)
            setError(null)
          } else if (result.reason === 'error' && 'error' in result) {
            setError(result.error ?? null)
            setLoading(false)
          } else {
            setLoading(false)
          }
        })
      }
    },
    [tasks, performFetch, canFetch, isLoggingOut],
  )

  /**
   * Handler to manually refetch
   */
  const refetch = useCallback(() => {
    // Don't refetch if not authenticated or logging out
    if (!canFetch) {
      console.log('⚠️ Cannot refetch: not authenticated or logging out')
      return
    }

    // Create new controller for manual refetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    // Set loading state before fetch
    setLoading(true)
    setError(null)

    // Perform fetch and handle loading state in callback
    performFetch(controller.signal).then((result) => {
      if (!isMountedRef.current) return

      if (result.success) {
        setTasks(result.tasks)
        setStats(result.stats)
        setLoading(false)
        setError(null)
      } else if (result.reason === 'error' && 'error' in result) {
        setError(result.error ?? null)
        setLoading(false)
      } else {
        setLoading(false)
      }
    })
  }, [performFetch, canFetch])

  return {
    tasks,
    stats,
    loading,
    error,
    refetch,
    toggleTask,
  }
}
