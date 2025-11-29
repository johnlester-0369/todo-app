import React from 'react'
import { Pressable, Text, View, StyleProp, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/utils/cn.util'

/**
 * FloatingActionButton Props
 */
interface FloatingActionButtonProps {
  onPress: () => void
  icon: React.ReactNode
  label?: string
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  className?: string
  /** Additional bottom offset in pixels (added to safe area + base spacing) */
  bottomOffset?: number
}

/**
 * Horizontal position classes for FAB placement
 * Note: Bottom positioning is handled dynamically via safe area insets
 */
const horizontalPositionClasses: Record<
  NonNullable<FloatingActionButtonProps['position']>,
  string
> = {
  'bottom-right': 'right-6',
  'bottom-left': 'left-6',
  'bottom-center': 'left-0 right-0 items-center',
}

/**
 * Size configurations
 */
const sizeConfig = {
  sm: {
    container: 'h-12 w-12',
    icon: 'h-5 w-5',
    extended: 'px-4 h-12',
  },
  md: {
    container: 'h-14 w-14',
    icon: 'h-6 w-6',
    extended: 'px-5 h-14',
  },
  lg: {
    container: 'h-16 w-16',
    icon: 'h-7 w-7',
    extended: 'px-6 h-16',
  },
}

/**
 * Variant color classes
 */
const variantClasses: Record<
  NonNullable<FloatingActionButtonProps['variant']>,
  string
> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  danger: 'bg-error',
}

/** Base bottom spacing in pixels (before adding safe area inset) */
const BASE_BOTTOM_SPACING = 24

/**
 * FloatingActionButton Component
 *
 * A floating action button (FAB) component for primary actions in mobile apps.
 * Supports icon-only and extended (with label) variants.
 *
 * Automatically accounts for safe area insets to avoid being obscured by
 * system navigation (iOS home indicator, Android gesture navigation bar).
 *
 * @example
 * ```tsx
 * // Icon-only FAB
 * <FloatingActionButton
 *   icon={<Plus className="h-6 w-6 text-white" />}
 *   onPress={() => console.log('FAB pressed')}
 *   position="bottom-right"
 * />
 *
 * // Extended FAB with label
 * <FloatingActionButton
 *   icon={<Plus className="h-6 w-6 text-white" />}
 *   label="Add Task"
 *   onPress={() => console.log('FAB pressed')}
 *   position="bottom-center"
 * />
 *
 * // With additional bottom offset (e.g., for tab navigation)
 * <FloatingActionButton
 *   icon={<Plus className="h-6 w-6 text-white" />}
 *   onPress={() => console.log('FAB pressed')}
 *   bottomOffset={60}
 * />
 * ```
 */
const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  label,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  disabled = false,
  style,
  className,
  bottomOffset = 0,
}) => {
  const isExtended = !!label
  const insets = useSafeAreaInsets()

  // Calculate total bottom spacing:
  // - Base spacing (24px) for visual padding from edge
  // - Safe area bottom inset (handles iOS home indicator, Android gesture nav)
  // - Optional additional offset (for custom layouts with tab bars, etc.)
  const totalBottomSpacing = BASE_BOTTOM_SPACING + insets.bottom + bottomOffset

  return (
    <View
      className={cn('absolute z-50', horizontalPositionClasses[position])}
      style={{ bottom: totalBottomSpacing }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={style}
        className={cn(
          // Base styles
          'flex-row items-center justify-center rounded-full shadow-lg',
          // Size
          isExtended ? sizeConfig[size].extended : sizeConfig[size].container,
          // Variant colors
          variantClasses[variant],
          // States
          disabled && 'opacity-50',
          !disabled && 'active:scale-95',
          // Custom className
          className,
        )}
      >
        {/* Icon */}
        <View className={cn(isExtended && 'mr-2')}>{icon}</View>

        {/* Label (Extended FAB) */}
        {isExtended && (
          <Text className="text-white font-semibold text-base">{label}</Text>
        )}
      </Pressable>
    </View>
  )
}

export default FloatingActionButton
