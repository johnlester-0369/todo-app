import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTaskMutations } from '@/features/tasks/hooks/useTaskMutations'
import { useTheme } from '@/contexts/ThemeContext'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

/**
 * New Task Screen (Full Page)
 *
 * Features:
 * - Full-page form for better UX
 * - Header with back (X) and save (✓) buttons
 * - Auto-focus on title input
 * - Keyboard-aware scrolling
 * - Validation with inline errors
 */
export default function NewTaskScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { getColor } = useTheme()

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Mutation hook
  const { createTask, isSubmitting } = useTaskMutations({
    onSuccess: () => {
      router.back()
    },
    onError: (message) => {
      setErrorMessage(message)
      setTimeout(() => setErrorMessage(''), 5000)
    },
  })

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

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) return

    await createTask({
      title: title.trim(),
      description: description.trim(),
    })
  }, [validateForm, createTask, title, description])

  // Handle close
  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  // Check if form is valid for save
  const canSave = title.trim().length >= 3 && description.trim().length >= 10

  return (
    <View className="flex-1 bg-bg">
      {/* Header */}
      <View
        className="bg-surface-1 border-b border-divider"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          {/* Close Button */}
          <TouchableOpacity
            onPress={handleClose}
            disabled={isSubmitting}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-hover-1"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={24} color={getColor('text')} />
          </TouchableOpacity>

          {/* Title */}
          <Text className="text-lg font-semibold text-headline">New Task</Text>

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
              autoFocus
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
