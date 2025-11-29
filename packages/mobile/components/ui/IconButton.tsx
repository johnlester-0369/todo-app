import React from 'react'
import {
  Pressable,
  ActivityIndicator,
  View,
  PressableProps,
} from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'unstyled'
type Size = 'sm' | 'md' | 'lg'

export interface IconButtonProps extends Omit<PressableProps, 'children'> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  icon: React.ReactNode
  disabled?: boolean
  accessibilityLabel: string // Required for accessibility
}

const base =
  'inline-flex items-center justify-center rounded-lg active:scale-95'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary active:bg-primary/80',
  secondary: 'bg-transparent border-2 border-primary active:bg-primary/20',
  ghost: 'bg-transparent active:bg-surface-hover-1',
  danger: 'bg-error active:bg-error/80',
  unstyled: 'bg-transparent border-0 p-0',
}

const sizeClasses: Record<Size, { container: string; spinner: number }> = {
  sm: { container: 'h-8 w-8 p-1.5', spinner: 14 },
  md: { container: 'h-10 w-10 p-2', spinner: 16 },
  lg: { container: 'h-12 w-12 p-2.5', spinner: 18 },
}

/**
 * IconButton component for React Native
 *
 * Touch-optimized button component for icon-only actions.
 * Uses theme colors from ThemeContext for spinner colors.
 *
 * @example
 * ```tsx
 * import { Settings, Trash } from 'lucide-react-native';
 *
 * <IconButton
 *   icon={<Settings size={20} color={getColor('on-primary')} />}
 *   variant="primary"
 *   accessibilityLabel="Settings"
 * />
 *
 * <IconButton
 *   icon={<Trash size={16} color={getColor('on-primary')} />}
 *   variant="danger"
 *   size="sm"
 *   accessibilityLabel="Delete"
 * />
 * ```
 */
const IconButton = React.forwardRef<View, IconButtonProps>(
  (
    {
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      icon,
      disabled,
      accessibilityLabel,
      className,
      ...props
    },
    ref,
  ) => {
    const { getColor } = useTheme()
    const config = sizeClasses[size]
    const isDisabled = Boolean(disabled || isLoading)

    /**
     * Get spinner color based on variant
     * Uses theme colors for consistency
     */
    const getSpinnerColor = (): string => {
      switch (variant) {
        case 'primary':
        case 'danger':
          return getColor('on-primary')
        case 'secondary':
          return getColor('primary')
        case 'ghost':
        case 'unstyled':
          return getColor('text')
        default:
          return getColor('primary')
      }
    }

    // Build className string
    const buttonClasses = [
      base,
      variantClasses[variant],
      variant !== 'unstyled' && config.container,
      isDisabled && 'opacity-60',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <Pressable
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isDisabled,
          busy: isLoading,
        }}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator size={config.spinner} color={getSpinnerColor()} />
        ) : (
          <View className="flex items-center justify-center">{icon}</View>
        )}
      </Pressable>
    )
  },
)

IconButton.displayName = 'IconButton'

export default IconButton
