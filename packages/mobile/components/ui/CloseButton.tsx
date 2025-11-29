import React from 'react'
import { Pressable, View, type PressableProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'

// ============================================================================
// Types
// ============================================================================

export interface CloseButtonProps extends Omit<PressableProps, 'children'> {
  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Visual variant
   * @default 'ghost'
   */
  variant?: 'ghost' | 'solid' | 'danger'

  /**
   * Accessibility label for screen readers
   * @default 'Close'
   */
  accessibilityLabel?: string

  /**
   * Icon color (overrides variant default)
   * If not provided, uses theme color based on variant
   */
  iconColor?: string

  /**
   * Custom class name for styling
   */
  className?: string
}

// ============================================================================
// Size Configuration
// ============================================================================

const sizeConfig = {
  sm: {
    container: 'w-8 h-8', // 32x32 points
    iconSize: 16,
  },
  md: {
    container: 'w-11 h-11', // 44x44 points (iOS minimum touch target)
    iconSize: 20,
  },
  lg: {
    container: 'w-12 h-12', // 48x48 points
    iconSize: 24,
  },
} as const

// ============================================================================
// Variant Configuration
// ============================================================================

const variantConfig = {
  ghost: {
    default: 'bg-transparent',
    pressed: 'bg-surface-hover-1',
    colorKey: 'muted', // Theme color key
  },
  solid: {
    default: 'bg-surface-2',
    pressed: 'bg-surface-hover-2',
    colorKey: 'foreground', // Theme color key
  },
  danger: {
    default: 'bg-error/10',
    pressed: 'bg-error/20',
    colorKey: 'error', // Theme color key
  },
} as const

// ============================================================================
// CloseButton Component
// ============================================================================

/**
 * CloseButton - Mobile-optimized close button component
 *
 * Features:
 * - Minimum 44x44 touch target (iOS guidelines)
 * - Press feedback with opacity and background
 * - Multiple sizes and variants
 * - Theme-aware icon colors
 * - Accessibility support
 * - Consistent with web CloseButton API
 *
 * @example
 * ```tsx
 * <CloseButton onPress={handleClose} />
 * <CloseButton size="sm" variant="danger" />
 * <CloseButton accessibilityLabel="Close dialog" />
 * ```
 */
const CloseButton = React.forwardRef<View, CloseButtonProps>(
  (
    {
      size = 'md',
      variant = 'ghost',
      accessibilityLabel = 'Close',
      iconColor,
      className = '',
      ...props
    },
    ref,
  ) => {
    const { getColor } = useTheme()

    const sizeStyles = sizeConfig[size]
    const variantStyles = variantConfig[variant]

    // Use provided iconColor or get from theme based on variant
    const finalIconColor = iconColor || getColor(variantStyles.colorKey)

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Double tap to close"
        {...props}
      >
        {({ pressed }) => (
          <View
            className={`
              ${sizeStyles.container}
              ${pressed ? variantStyles.pressed : variantStyles.default}
              rounded-lg
              items-center
              justify-center
              ${className}
            `}
            style={{ opacity: pressed ? 0.7 : 1 }}
          >
            <Ionicons
              name="close"
              size={sizeStyles.iconSize}
              color={finalIconColor}
            />
          </View>
        )}
      </Pressable>
    )
  },
)

CloseButton.displayName = 'CloseButton'

export default CloseButton
