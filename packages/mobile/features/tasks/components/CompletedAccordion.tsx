import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import TaskItem from './TaskItem'
import type { Task } from '@/features/tasks/services/task.service'

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface CompletedAccordionProps {
  tasks: Task[]
  onTaskPress: (task: Task) => void
  onToggleComplete: (taskId: string) => void
  defaultExpanded?: boolean
}

/**
 * CompletedAccordion Component
 *
 * Collapsible section for completed tasks (Google Tasks pattern).
 * Shows count of completed tasks in the header.
 * Expands/collapses with animation.
 *
 * @example
 * ```tsx
 * <CompletedAccordion
 *   tasks={completedTasks}
 *   onTaskPress={(task) => router.push(`/task/${task.id}`)}
 *   onToggleComplete={(id) => toggleTask(id)}
 * />
 * ```
 */
const CompletedAccordion: React.FC<CompletedAccordionProps> = ({
  tasks,
  onTaskPress,
  onToggleComplete,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsExpanded(!isExpanded)
  }

  if (tasks.length === 0) {
    return null
  }

  return (
    <View>
      {/* Accordion Header */}
      <TouchableOpacity
        onPress={toggleExpanded}
        className="flex-row items-center justify-between py-3 px-1"
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`Completed tasks, ${tasks.length} items`}
        accessibilityHint="Tap to expand or collapse"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-forward'}
            size={18}
            color="#9CA3AF"
          />
          <Text className="text-base font-semibold text-muted">
            Completed ({tasks.length})
          </Text>
        </View>

        {/* Success indicator */}
        <View className="flex-row items-center gap-1">
          <Ionicons name="checkmark-done" size={16} color="#22C55E" />
        </View>
      </TouchableOpacity>

      {/* Accordion Content */}
      {isExpanded && (
        <View className="gap-3 mt-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onPress={onTaskPress}
              onToggleComplete={onToggleComplete}
              compact
            />
          ))}
        </View>
      )}
    </View>
  )
}

export default CompletedAccordion
