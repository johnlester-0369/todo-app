import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default 'lg'
   */
  size?: SpinnerSize
  /**
   * Optional loading message to display below spinner
   * @default 'Loading...'
   */
  message?: string
  /**
   * Whether to render as full-screen centered spinner
   * @default true
   */
  fullScreen?: boolean
  /**
   * Additional CSS classes for the container
   */
  className?: string
  /**
   * Custom color key from theme (e.g., 'primary', 'secondary', 'error')
   * @default 'primary'
   */
  colorKey?: string
}

const sizeMap: Record<SpinnerSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
  xl: 'large',
}

const scaleMap: Record<SpinnerSize, number> = {
  sm: 0.75,
  md: 1,
  lg: 1.5,
  xl: 2,
}

/**
 * LoadingSpinner component
 *
 * Displays an animated loading spinner with optional message.
 * Uses theme colors from ThemeContext, automatically updating when theme changes.
 *
 * @example
 * ```tsx
 * // Full-screen loader with primary color (default)
 * <LoadingSpinner />
 *
 * // Custom message
 * <LoadingSpinner message="Authenticating..." />
 *
 * // Inline spinner with different color
 * <LoadingSpinner fullScreen={false} size="sm" colorKey="secondary" />
 *
 * // Error-colored spinner
 * <LoadingSpinner colorKey="error" message="Retrying..." />
 * ```
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  message = 'Loading...',
  fullScreen = true,
  className = '',
  colorKey = 'primary',
}) => {
  const { getColor } = useTheme()

  // Get spinner color from theme
  const spinnerColor = getColor(colorKey)

  const activitySize = sizeMap[size]
  const scale = scaleMap[size]

  const spinner = (
    <View className={`items-center ${!fullScreen ? className : ''}`}>
      <View style={{ transform: [{ scale }] }}>
        <ActivityIndicator
          size={activitySize}
          color={spinnerColor}
          accessibilityLabel={message}
        />
      </View>
      {message && <Text className="mt-4 text-text text-center">{message}</Text>}
    </View>
  )

  if (fullScreen) {
    return (
      <View className={`flex-1 items-center justify-center bg-bg ${className}`}>
        {spinner}
      </View>
    )
  }

  return spinner
}

export default LoadingSpinner
