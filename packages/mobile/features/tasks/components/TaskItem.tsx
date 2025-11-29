import React from 'react'
import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Task } from '@/features/tasks/services/task.service'

interface TaskItemProps {
  task: Task
  onPress: (task: Task) => void
  onToggleComplete: (taskId: string) => void
  compact?: boolean
}

/**
 * TaskItem Component
 *
 * Tappable task item for the task list.
 * - Tap anywhere on the card to edit (navigates to edit screen)
 * - Tap the checkbox to toggle completion
 * - No visible action icons (edit/delete) - cleaner mobile pattern
 *
 * @example
 * ```tsx
 * <TaskItem
 *   task={task}
 *   onPress={(task) => router.push(`/task/${task.id}`)}
 *   onToggleComplete={(id) => toggleTask(id)}
 * />
 * ```
 */
const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onPress,
  onToggleComplete,
  compact = false,
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  return (
    <Pressable
      onPress={() => onPress(task)}
      className="bg-surface-2 rounded-xl active:bg-surface-hover-2 overflow-hidden"
      accessibilityRole="button"
      accessibilityLabel={`${task.completed ? 'Completed' : 'Active'} task: ${task.title}`}
      accessibilityHint="Tap to edit this task"
    >
      <View className={`flex-row items-start gap-3 ${compact ? 'p-3' : 'p-4'}`}>
        {/* Completion Toggle */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation()
            onToggleComplete(task.id)
          }}
          className="mt-0.5 flex-shrink-0 p-1 -m-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.completed }}
          accessibilityLabel={
            task.completed ? 'Mark as incomplete' : 'Mark as complete'
          }
        >
          <Ionicons
            name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={task.completed ? '#22C55E' : '#9CA3AF'}
          />
        </TouchableOpacity>

        {/* Task Content */}
        <View className="flex-1 min-w-0">
          <Text
            className={`text-base font-semibold ${
              task.completed ? 'text-muted line-through' : 'text-headline'
            }`}
            numberOfLines={compact ? 1 : 2}
          >
            {task.title}
          </Text>

          {!compact && (
            <Text
              className={`text-sm mt-1 ${
                task.completed ? 'text-muted' : 'text-text'
              }`}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}

          <View className="flex-row items-center gap-1 mt-2">
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text className="text-xs text-muted">
              {formatDate(task.createdAt)}
            </Text>
          </View>
        </View>

        {/* Chevron Indicator - shows it's tappable */}
        <View className="self-center ml-2">
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </View>
    </Pressable>
  )
}

export default TaskItem
