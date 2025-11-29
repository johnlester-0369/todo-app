import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'

export type AlertVariant = 'success' | 'error' | 'warning' | 'info'

export interface AlertProps {
  variant?: AlertVariant
  title: string
  message?: string
  onClose?: () => void
  className?: string
}

/**
 * Variant configuration for icon names and container styles
 * Icon colors are handled dynamically via getColor()
 */
const variantConfig: Record<
  AlertVariant,
  {
    containerClass: string
    iconName: keyof typeof Ionicons.glyphMap
    colorKey: string // Key for getColor()
  }
> = {
  success: {
    containerClass: 'bg-success/10 border-success/20',
    iconName: 'checkmark-circle',
    colorKey: 'success',
  },
  error: {
    containerClass: 'bg-error/10 border-error/20',
    iconName: 'alert-circle',
    colorKey: 'error',
  },
  warning: {
    containerClass: 'bg-warning/10 border-warning/20',
    iconName: 'warning',
    colorKey: 'warning',
  },
  info: {
    containerClass: 'bg-info/10 border-info/20',
    iconName: 'information-circle',
    colorKey: 'info',
  },
}

/**
 * Alert component for displaying feedback messages
 *
 * Uses theme colors from ThemeContext for icon colors,
 * automatically updating when theme changes.
 *
 * @example
 * ```tsx
 * <Alert variant="success" title="Success!" />
 * <Alert variant="error" title="Failed" message="Please try again." onClose={() => setError(null)} />
 * ```
 */
const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const { getColor } = useTheme()
  const config = variantConfig[variant]

  // Get the icon color from theme
  const iconColor = getColor(config.colorKey)

  return (
    <View
      className={`p-4 border rounded-lg flex-row items-start gap-3 ${config.containerClass} ${className}`}
      accessibilityRole="alert"
    >
      <View className="mt-0.5">
        <Ionicons name={config.iconName} size={20} color={iconColor} />
      </View>

      <View className="flex-1">
        <Text className="text-sm font-semibold text-text">{title}</Text>
        {message && (
          <Text className="text-sm mt-1 text-text opacity-90">{message}</Text>
        )}
      </View>

      {onClose && (
        <Pressable
          onPress={onClose}
          className="active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Close alert"
        >
          <Ionicons name="close" size={16} color={iconColor} />
        </Pressable>
      )}
    </View>
  )
}

export default Alert
