import React from 'react'
import { Pressable, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'

type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps {
  /**
   * Controlled checked state
   */
  checked?: boolean
  /**
   * Default checked state for uncontrolled usage
   */
  defaultChecked?: boolean
  /**
   * Callback when checkbox state changes
   */
  onChange?: (checked: boolean) => void
  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean
  /**
   * Label text displayed next to checkbox
   */
  label?: string
  /**
   * Size variant
   * @default 'md'
   */
  size?: CheckboxSize
  /**
   * Additional className for the container
   */
  className?: string
}

// Size configurations
const sizeConfig: Record<
  CheckboxSize,
  {
    boxSize: number
    iconSize: number
    labelClass: string
  }
> = {
  sm: {
    boxSize: 18,
    iconSize: 14,
    labelClass: 'text-sm',
  },
  md: {
    boxSize: 22,
    iconSize: 18,
    labelClass: 'text-base',
  },
  lg: {
    boxSize: 28,
    iconSize: 22,
    labelClass: 'text-lg',
  },
}

/**
 * Checkbox component for binary selection controls
 *
 * Uses theme colors from ThemeContext for consistent styling.
 * Supports both controlled and uncontrolled usage patterns.
 *
 * @example
 * ```tsx
 * // Controlled
 * <Checkbox
 *   checked={rememberMe}
 *   onChange={setRememberMe}
 *   label="Remember me"
 * />
 *
 * // Uncontrolled with default
 * <Checkbox defaultChecked label="Accept terms" />
 *
 * // Different sizes
 * <Checkbox size="sm" label="Small" />
 * <Checkbox size="lg" label="Large" />
 * ```
 */
const Checkbox: React.FC<CheckboxProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  size = 'md',
  className = '',
}) => {
  const { getColor } = useTheme()
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)

  const isControlled = controlledChecked !== undefined
  const checked = isControlled ? controlledChecked : internalChecked

  const config = sizeConfig[size]

  // Get theme colors
  const primaryColor = getColor('primary')
  const borderColor = getColor('border')
  const onPrimaryColor = getColor('on-primary')

  const handleToggle = () => {
    if (disabled) return

    const newChecked = !checked

    if (!isControlled) {
      setInternalChecked(newChecked)
    }

    onChange?.(newChecked)
  }

  const checkboxElement = (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label || (checked ? 'Checked' : 'Unchecked')}
      className={`items-center justify-center rounded ${
        disabled ? 'opacity-50' : 'active:opacity-80'
      }`}
      style={{
        width: config.boxSize,
        height: config.boxSize,
        backgroundColor: checked ? primaryColor : 'transparent',
        borderWidth: 2,
        borderColor: checked ? primaryColor : borderColor,
        borderRadius: 4,
      }}
    >
      {checked && (
        <Ionicons
          name="checkmark"
          size={config.iconSize}
          color={onPrimaryColor}
        />
      )}
    </Pressable>
  )

  // If no label, return just the checkbox
  if (!label) {
    return checkboxElement
  }

  // With label, wrap in a pressable container
  return (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      className={`flex-row items-center gap-3 ${className}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
    >
      <View
        className={`items-center justify-center rounded ${
          disabled ? 'opacity-50' : ''
        }`}
        style={{
          width: config.boxSize,
          height: config.boxSize,
          backgroundColor: checked ? primaryColor : 'transparent',
          borderWidth: 2,
          borderColor: checked ? primaryColor : borderColor,
          borderRadius: 4,
        }}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={config.iconSize}
            color={onPrimaryColor}
          />
        )}
      </View>
      <Text
        className={`font-medium text-text ${config.labelClass} ${
          disabled ? 'opacity-60' : ''
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export default Checkbox
