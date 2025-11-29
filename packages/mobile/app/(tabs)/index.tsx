import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTasks } from '@/features/tasks/hooks/useTasks'
import { useUserAuth } from '@/contexts/UserAuthContext'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import FloatingActionButton from '@/components/ui/FloatingActionButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TaskItem from '@/features/tasks/components/TaskItem'
import CompletedAccordion from '@/features/tasks/components/CompletedAccordion'
import { BrandLogo, BrandName } from '@/components/common/Brand'
import type { Task } from '@/features/tasks/services/task.service'
import { useTheme } from '@/contexts/ThemeContext'

/**
 * Tasks Screen (Main Tab)
 *
 * Features:
 * - Active tasks list (tappable to edit)
 * - Completed tasks in collapsible accordion
 * - FAB for creating new tasks
 * - Pull to refresh
 * - Auto-refresh when screen gains focus (after create/edit/delete)
 * - Clean header with branding only
 */
export default function TasksScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useUserAuth()
  const { getColor } = useTheme()

  // Theme colors for native components
  const onPrimaryColor = getColor('on-primary')

  // State
  const [refreshing, setRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Fetch all tasks (we'll separate active/completed in render)
  const { tasks, loading, error, refetch, toggleTask } = useTasks({
    status: 'all',
  })

  // Separate active and completed tasks
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  /**
   * Auto-refresh tasks when screen gains focus
   *
   * This ensures the list updates automatically after:
   * - Creating a new task (returning from task/new)
   * - Editing a task (returning from task/[id])
   * - Deleting a task (returning from task/[id])
   *
   * useFocusEffect runs every time the screen comes into focus,
   * similar to componentDidFocus in class components.
   */
  useFocusEffect(
    useCallback(() => {
      // Refetch tasks when screen gains focus
      // This won't show loading spinner (preserves current UI)
      // but will update the data in the background
      refetch()
    }, [refetch]),
  )

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handleTaskPress = useCallback(
    (task: Task) => {
      router.push(`/(tabs)/task/${task.id}`)
    },
    [router],
  )

  const handleToggleComplete = useCallback(
    async (taskId: string) => {
      try {
        await toggleTask(taskId)
      } catch (error) {
        // Log error for debugging but don't show to user
        console.error('Failed to toggle task:', error)
        setErrorMessage('Failed to update task')
        setTimeout(() => setErrorMessage(''), 3000)
      }
    },
    [toggleTask],
  )

  const handleCreateTask = useCallback(() => {
    router.push('/(tabs)/task/new')
  }, [router])

  // Render empty state
  const renderEmptyState = () => (
    <Card.Root padding="lg" className="mx-4 mt-8">
      <View className="items-center py-8">
        <Ionicons name="checkbox-outline" size={64} color="#9CA3AF" />
        <Text className="text-lg font-semibold text-headline mt-4 mb-2">
          No tasks yet
        </Text>
        <Text className="text-text text-center mb-4">
          Tap the + button to create your first task
        </Text>
      </View>
    </Card.Root>
  )

  // Render error state
  const renderErrorState = () => (
    <Card.Root padding="lg" className="mx-4 mt-8">
      <View className="items-center py-8">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-lg font-semibold text-headline mt-4 mb-2">
          Error Loading Tasks
        </Text>
        <Text className="text-text text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={refetch}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-on-primary font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    </Card.Root>
  )

  // Main loading state (only show on initial load with no data)
  if (loading && !refreshing && tasks.length === 0) {
    return <LoadingSpinner message="Loading tasks..." />
  }

  return (
    <View className="flex-1 bg-bg">
      {/* Header */}
      <View
        className="bg-surface-1 border-b border-divider px-4 pb-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center gap-3">
          <BrandLogo size="md" />
          <View>
            <BrandName />
            <Text className="text-sm text-muted">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}
            </Text>
          </View>
        </View>
      </View>

      {/* Error Message */}
      {errorMessage && (
        <View className="px-4 pt-4">
          <Alert
            variant="error"
            title={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        </View>
      )}

      {/* Task List */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-24"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {error ? (
          renderErrorState()
        ) : tasks.length === 0 ? (
          renderEmptyState()
        ) : (
          <View className="pt-4">
            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <View className="px-4 gap-3">
                {activeTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onPress={handleTaskPress}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </View>
            )}

            {/* Active tasks empty state (but has completed) */}
            {activeTasks.length === 0 && completedTasks.length > 0 && (
              <View className="px-4 py-8 items-center">
                <Ionicons name="checkmark-done" size={48} color="#22C55E" />
                <Text className="text-headline font-semibold mt-3">
                  All caught up!
                </Text>
                <Text className="text-muted text-center mt-1">
                  {"You've completed all your tasks"}
                </Text>
              </View>
            )}

            {/* Completed Tasks Accordion */}
            {completedTasks.length > 0 && (
              <View className="mt-6 px-4">
                <CompletedAccordion
                  tasks={completedTasks}
                  onTaskPress={handleTaskPress}
                  onToggleComplete={handleToggleComplete}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<Ionicons name="add" size={28} color={onPrimaryColor} />}
        onPress={handleCreateTask}
        position="bottom-right"
        size="lg"
        variant="primary"
      />
    </View>
  )
}
