import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTaskMutations } from '@/features/tasks/hooks/useTaskMutations'
import { useTheme } from '@/contexts/ThemeContext'
import { taskService, type Task } from '@/features/tasks/services/task.service'
import Alert from '@/components/ui/Alert'
import Dialog from '@/components/ui/Dialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

/**
 * Edit Task Screen (Full Page)
 *
 * Features:
 * - Full-page form for better UX
 * - Header with back (←) and save (✓) buttons
 * - Kebab menu (⋮) for delete action
 * - Loads existing task data
 * - Validation with inline errors
 * - Custom Dialog for confirmations (discard changes, delete task)
 */
export default function EditTaskScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { getColor } = useTheme()

  // Task loading state
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  // Dialog state
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Mutation hook
  const { updateTask, deleteTask, isSubmitting } = useTaskMutations({
    onSuccess: () => {
      router.back()
    },
    onError: (message) => {
      setErrorMessage(message)
      setTimeout(() => setErrorMessage(''), 5000)
    },
  })

  // Load task data
  useEffect(() => {
    const loadTask = async () => {
      if (!id) {
        setLoadError('Task ID not found')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const fetchedTask = await taskService.getTaskById(id)
        console.log(fetchedTask)
        setTask(fetchedTask)
        setTitle(fetchedTask.title)
        setDescription(fetchedTask.description)
      } catch (err) {
        console.error('Failed to load task:', err)
        setLoadError('Failed to load task')
      } finally {
        setIsLoading(false)
      }
    }

    loadTask()
  }, [id])

  // Validation
  const validateForm = useCallback((): boolean => {
    let isValid = true
    setTitleError('')
    setDescriptionError('')

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      setTitleError('Task title is required')
      isValid = false
    } else if (trimmedTitle.length < 3) {
      setTitleError('Title must be at least 3 characters')
      isValid = false
    } else if (trimmedTitle.length > 100) {
      setTitleError('Title must not exceed 100 characters')
      isValid = false
    }

    if (!trimmedDescription) {
      setDescriptionError('Description is required')
      isValid = false
    } else if (trimmedDescription.length < 10) {
      setDescriptionError('Description must be at least 10 characters')
      isValid = false
    } else if (trimmedDescription.length > 500) {
      setDescriptionError('Description must not exceed 500 characters')
      isValid = false
    }

    return isValid
  }, [title, description])

  // Check if form has changes
  const hasChanges =
    task &&
    (title.trim() !== task.title || description.trim() !== task.description)

  // Check if form is valid for save
  const canSave =
    title.trim().length >= 3 && description.trim().length >= 10 && hasChanges

  // Handle save
  const handleSave = useCallback(async () => {
    if (!task || !validateForm()) return

    await updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
    })
  }, [task, validateForm, updateTask, title, description])

  // Handle back - opens dialog if there are unsaved changes
  const handleBack = useCallback(() => {
    if (hasChanges) {
      setShowDiscardDialog(true)
    } else {
      router.back()
    }
  }, [hasChanges, router])

  // Confirm discard changes and navigate back
  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardDialog(false)
    router.back()
  }, [router])

  // Handle delete - opens confirmation dialog
  const handleDelete = useCallback(() => {
    setShowMenu(false)
    setShowDeleteDialog(true)
  }, [])

  // Confirm delete and execute
  const handleConfirmDelete = useCallback(async () => {
    setShowDeleteDialog(false)
    if (task) {
      await deleteTask(task.id)
    }
  }, [task, deleteTask])

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Loading task..." />
  }

  // Error state
  if (loadError || !task) {
    return (
      <View className="flex-1 bg-bg items-center justify-center p-4">
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={getColor('error')}
        />
        <Text className="text-lg font-semibold text-headline mt-4 mb-2">
          {loadError || 'Task not found'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-lg mt-4"
        >
          <Text className="text-on-primary font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-bg">
      {/* Header */}
      <View
        className="bg-surface-1 border-b border-divider"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            disabled={isSubmitting}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-hover-1"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={getColor('text')} />
          </TouchableOpacity>

          {/* Title */}
          <Text className="text-lg font-semibold text-headline">Edit Task</Text>

          {/* Right Actions */}
          <View className="flex-row items-center gap-1">
            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSubmitting || !canSave}
              className={`w-10 h-10 items-center justify-center rounded-full ${
                canSave && !isSubmitting ? 'active:bg-primary/10' : 'opacity-40'
              }`}
              accessibilityLabel="Save task"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" fullScreen={false} message="" />
              ) : (
                <Ionicons
                  name="checkmark"
                  size={24}
                  color={canSave ? getColor('primary') : getColor('muted')}
                />
              )}
            </TouchableOpacity>

            {/* Menu Button */}
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              disabled={isSubmitting}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-hover-1"
              accessibilityLabel="More options"
            >
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={getColor('text')}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdown Menu */}
        {showMenu && (
          <View
            className="absolute right-4 top-full mt-1 bg-surface-2 rounded-lg shadow-lg border border-border z-50 overflow-hidden"
            style={{ top: insets.top + 48 }}
          >
            <TouchableOpacity
              onPress={handleDelete}
              className="flex-row items-center gap-3 px-4 py-3 active:bg-error/10"
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={getColor('error')}
              />
              <Text className="text-error font-medium">Delete Task</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Backdrop for menu */}
      {showMenu && (
        <TouchableOpacity
          className="absolute inset-0 z-40"
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
          style={{ top: insets.top + 56 }}
        />
      )}

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

      {/* Form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4"
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-muted mb-2 uppercase tracking-wide">
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text)
                if (titleError) setTitleError('')
              }}
              placeholder="What needs to be done?"
              placeholderTextColor={getColor('muted')}
              maxLength={100}
              className={`text-xl font-semibold text-headline bg-transparent pb-3 border-b-2 ${
                titleError
                  ? 'border-error'
                  : 'border-divider focus:border-primary'
              }`}
            />
            {titleError && (
              <Text className="text-error text-sm mt-2">{titleError}</Text>
            )}
            <Text className="text-muted text-xs mt-2 text-right">
              {title.length}/100
            </Text>
          </View>

          {/* Description Input */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2 uppercase tracking-wide">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={(text) => {
                setDescription(text)
                if (descriptionError) setDescriptionError('')
              }}
              placeholder="Add more details..."
              placeholderTextColor={getColor('muted')}
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
              className={`text-base text-text bg-surface-1 p-4 rounded-lg min-h-[160px] border-2 ${
                descriptionError
                  ? 'border-error'
                  : 'border-transparent focus:border-primary'
              }`}
            />
            {descriptionError && (
              <Text className="text-error text-sm mt-2">
                {descriptionError}
              </Text>
            )}
            <Text className="text-muted text-xs mt-2 text-right">
              {description.length}/500
            </Text>
          </View>

          {/* Task Meta Info */}
          <View className="mt-8 p-4 bg-surface-1 rounded-lg">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons
                name="calendar-outline"
                size={16}
                color={getColor('muted')}
              />
              <Text className="text-sm text-muted">
                Created{' '}
                {new Date(task.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons
                name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={task.completed ? getColor('success') : getColor('muted')}
              />
              <Text className="text-sm text-muted">
                {task.completed ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Discard Changes Dialog */}
      <Dialog.Root
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        closeOnOverlayPress={true}
      >
        <Dialog.Portal animationType="fade">
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content size="sm">
              <Dialog.Header>
                <View className="flex-1">
                  <Dialog.Title>Discard Changes?</Dialog.Title>
                </View>
                <Dialog.CloseTrigger size="sm" />
              </Dialog.Header>

              <Dialog.Body scrollable={false}>
                <Text className="text-text text-base leading-6">
                  You have unsaved changes. Are you sure you want to go back?
                </Text>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <TouchableOpacity
                    className="px-4 py-2.5 rounded-lg active:bg-surface-hover-1"
                    accessibilityRole="button"
                    accessibilityLabel="Keep editing"
                  >
                    <Text className="text-muted font-medium text-base">
                      Keep Editing
                    </Text>
                  </TouchableOpacity>
                </Dialog.CloseTrigger>
                <TouchableOpacity
                  onPress={handleConfirmDiscard}
                  className="px-4 py-2.5 rounded-lg bg-error active:bg-error/80"
                  accessibilityRole="button"
                  accessibilityLabel="Discard changes"
                >
                  <Text className="text-white font-medium text-base">
                    Discard
                  </Text>
                </TouchableOpacity>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Task Dialog */}
      <Dialog.Root
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        closeOnOverlayPress={true}
      >
        <Dialog.Portal animationType="fade">
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content size="sm">
              <Dialog.Header>
                <View className="flex-1">
                  <Dialog.Title>Delete Task</Dialog.Title>
                </View>
                <Dialog.CloseTrigger size="sm" />
              </Dialog.Header>

              <Dialog.Body scrollable={false}>
                <Text className="text-text text-base leading-6">
                  Are you sure you want to delete {`"${task.title}"`}? This
                  action cannot be undone.
                </Text>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <TouchableOpacity
                    className="px-4 py-2.5 rounded-lg active:bg-surface-hover-1"
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                  >
                    <Text className="text-muted font-medium text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </Dialog.CloseTrigger>
                <TouchableOpacity
                  onPress={handleConfirmDelete}
                  className="px-4 py-2.5 rounded-lg bg-error active:bg-error/80"
                  accessibilityRole="button"
                  accessibilityLabel="Delete task"
                >
                  <Text className="text-white font-medium text-base">
                    Delete
                  </Text>
                </TouchableOpacity>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Portal>
      </Dialog.Root>
    </View>
  )
}
