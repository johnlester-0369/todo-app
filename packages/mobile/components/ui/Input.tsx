import React, { useState } from 'react'
import { View, Text, TextInput, TextInputProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'

type InputVariant = 'default' | 'error' | 'success'
type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends TextInputProps {
  label?: string
  helperText?: string
  error?: string
  variant?: InputVariant
  inputSize?: InputSize
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  containerClassName?: string
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
}

const iconSizeMap: Record<InputSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
}

/**
 * Input component for React Native with NativeWind styling
 *
 * Uses theme colors from ThemeContext for validation icons and placeholder,
 * automatically updating when theme changes.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="you@example.com"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={emailError}
 *   leftIcon={<Ionicons name="mail-outline" size={20} color={getColor('muted')} />}
 * />
 * ```
 */
const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'default',
      inputSize = 'md',
      leftIcon,
      rightIcon,
      fullWidth = true,
      containerClassName = '',
      editable = true,
      ...props
    },
    ref,
  ) => {
    const { getColor } = useTheme()
    const [isFocused, setIsFocused] = useState(false)

    const actualVariant = error ? 'error' : variant

    // Show validation icon for error and success variants
    const showValidationIcon =
      actualVariant === 'error' || actualVariant === 'success'
    const ValidationIcon =
      actualVariant === 'error' ? 'alert-circle' : 'checkmark-circle'

    // Get theme colors for validation icons and placeholder
    const validationIconColor =
      actualVariant === 'error' ? getColor('error') : getColor('success')
    const placeholderColor = getColor('muted')

    // Variant styles
    const variantClasses: Record<InputVariant, string> = {
      default: 'border-border',
      error: 'border-error bg-error/5',
      success: 'border-success bg-success/5',
    }

    const inputClasses = `
      w-full rounded-lg border-2 bg-surface-1 text-text
      ${sizeClasses[inputSize]}
      ${variantClasses[actualVariant]}
      ${isFocused && actualVariant === 'default' ? 'border-primary' : ''}
      ${leftIcon ? 'pl-12' : ''}
      ${rightIcon || showValidationIcon ? 'pr-12' : ''}
      ${!editable ? 'opacity-60' : ''}
    `.trim()

    const containerClasses = `
      ${fullWidth ? 'w-full' : ''}
      ${containerClassName}
    `.trim()

    const iconSize = iconSizeMap[inputSize]

    return (
      <View className={containerClasses}>
        {label && (
          <Text className="text-sm font-medium text-headline mb-2">
            {label}
          </Text>
        )}

        <View className="relative">
          {leftIcon && (
            <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              {leftIcon}
            </View>
          )}

          <TextInput
            ref={ref}
            className={inputClasses}
            placeholderTextColor={placeholderColor}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            editable={editable}
            {...props}
          />

          {(rightIcon || showValidationIcon) && (
            <View className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
              {showValidationIcon ? (
                <Ionicons
                  name={ValidationIcon}
                  size={iconSize}
                  color={validationIconColor}
                />
              ) : (
                rightIcon
              )}
            </View>
          )}
        </View>

        {(error || helperText) && (
          <Text
            className={`mt-1.5 text-sm ${error ? 'text-error' : 'text-muted'}`}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    )
  },
)

Input.displayName = 'Input'

export default Input
