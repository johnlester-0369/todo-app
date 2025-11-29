import React from 'react'
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  PressableProps,
} from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'unstyled'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary active:bg-primary/90',
  secondary: 'bg-transparent border-2 border-primary active:bg-primary/10',
  ghost: 'bg-transparent active:bg-surface-hover-2',
  danger: 'bg-error active:bg-error/90',
  unstyled: 'bg-transparent',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 gap-1.5',
  md: 'px-4 py-3 gap-2',
  lg: 'px-6 py-4 gap-2.5',
}

const textVariantClasses: Record<Variant, string> = {
  primary: 'text-on-primary',
  secondary: 'text-primary',
  ghost: 'text-text',
  danger: 'text-white',
  unstyled: 'text-text',
}

const textSizeClasses: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const spinnerSizeMap: Record<Size, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
}

/**
 * Button component for React Native with NativeWind styling
 *
 * Uses theme colors from ThemeContext for spinner colors,
 * automatically updating when theme changes.
 *
 * @example
 * ```tsx
 * <Button
 *   variant="primary"
 *   onPress={handleSubmit}
 *   leftIcon={<Ionicons name="log-in-outline" size={20} color="#fff" />}
 * >
 *   Submit
 * </Button>
 * <Button variant="secondary" size="sm" isLoading={loading}>
 *   Cancel
 * </Button>
 * ```
 */
const Button = React.forwardRef<View, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      className = '',
      ...props
    },
    ref,
  ) => {
    const { getColor } = useTheme()
    const isDisabled = disabled || isLoading

    /**
     * Get spinner color based on variant
     * Uses theme colors for consistency across themes
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

    const buttonClasses = `
      flex-row items-center justify-center rounded-lg
      ${variantClasses[variant]}
      ${variant !== 'unstyled' ? sizeClasses[size] : ''}
      ${fullWidth ? 'w-full' : ''}
      ${isDisabled ? 'opacity-60' : ''}
      ${className}
    `.trim()

    const textClasses = `
      font-semibold text-center
      ${textVariantClasses[variant]}
      ${textSizeClasses[size]}
    `.trim()

    const spinnerColor = getSpinnerColor()
    const spinnerSize = spinnerSizeMap[size]

    return (
      <Pressable
        ref={ref as React.Ref<View>}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator size={spinnerSize} color={spinnerColor} />
        ) : (
          <>
            {leftIcon && (
              <View className="flex items-center justify-center">
                {leftIcon}
              </View>
            )}
            <Text className={textClasses}>{children}</Text>
            {rightIcon && (
              <View className="flex items-center justify-center">
                {rightIcon}
              </View>
            )}
          </>
        )}
      </Pressable>
    )
  },
)

Button.displayName = 'Button'

export default Button
