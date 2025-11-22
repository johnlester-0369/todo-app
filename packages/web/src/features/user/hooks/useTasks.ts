import { useState, useEffect, useCallback, useRef } from 'react'
import { taskService, type Task, type TaskStats } from '@/features/user/services/task.service'

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
 * Custom hook to fetch and manage tasks with filters and stats
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
  const {
    search = '',
    status = 'all',
  } = options

  // State - Initialize loading as true since we fetch on mount
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    active: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  /**
   * Fetch tasks and stats together (single request cycle)
   */
  const performFetch = useCallback(async (signal: AbortSignal) => {
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
        return { success: false as const }
      }

      return {
        success: true as const,
        tasks: fetchedTasks,
        stats: fetchedStats,
      }
    } catch (err: unknown) {
      // Ignore aborted requests
      if ((err as { isAborted?: boolean }).isAborted || (err as Error).name === 'AbortError') {
        return { success: false as const }
      }

      console.error('Failed to fetch data:', err)
      return {
        success: false as const,
        error: 'Failed to load tasks. Please try again.',
      }
    }
  }, [search, status])

  /**
   * Effect to fetch data when dependencies change
   */
  useEffect(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
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
      } else if ('error' in result) {
        setError(result.error)
        setLoading(false)
      } else {
        // If aborted, reset loading state
        setLoading(false)
      }
    })

    // Cleanup: abort pending requests on unmount or when effect re-runs
    return () => {
      abortController.abort()
    }
  }, [performFetch])

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
        console.error('Error toggling task:', err)
        
        // Revert optimistic update by triggering re-fetch
        if (!isMountedRef.current) return

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
          } else if ('error' in result) {
            setError(result.error)
            setLoading(false)
          } else {
            setLoading(false)
          }
        })
      }
    },
    [tasks, performFetch],
  )

  /**
   * Handler to manually refetch
   */
  const refetch = useCallback(() => {
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
      } else if ('error' in result) {
        setError(result.error)
        setLoading(false)
      } else {
        setLoading(false)
      }
    })
  }, [performFetch])

  return {
    tasks,
    stats,
    loading,
    error,
    refetch,
    toggleTask,
  }
}