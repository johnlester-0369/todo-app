import React, { useState } from 'react'
import { Pressable, View, Text, Animated } from 'react-native'

type ToggleSize = 'sm' | 'md' | 'lg'

export interface ToggleProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  size?: ToggleSize
  className?: string
}

// Size configurations with explicit pixel dimensions matching web exactly
// Formula: translateX when ON = containerWidth - thumbWidth - padding(4px)
const sizeConfig = {
  sm: {
    containerWidth: 36, // w-9 = 9 * 4px
    containerHeight: 20, // h-5 = 5 * 4px
    thumbSize: 12, // w-3 h-3 = 3 * 4px
    translateXOff: 4, // padding on left when OFF
    translateXOn: 20, // 36 - 12 - 4 = 20px (ensures 4px padding on right)
    label: 'text-sm',
  },
  md: {
    containerWidth: 44, // w-11 = 11 * 4px
    containerHeight: 24, // h-6 = 6 * 4px
    thumbSize: 16, // w-4 h-4 = 4 * 4px
    translateXOff: 4,
    translateXOn: 24, // 44 - 16 - 4 = 24px
    label: 'text-base',
  },
  lg: {
    containerWidth: 56, // w-14 = 14 * 4px
    containerHeight: 28, // h-7 = 7 * 4px
    thumbSize: 20, // w-5 h-5 = 5 * 4px
    translateXOff: 4,
    translateXOn: 32, // 56 - 20 - 4 = 32px
    label: 'text-lg',
  },
}

/**
 * Toggle (Switch) component for binary state controls
 * Matches web implementation appearance exactly with proper padding on both sides
 *
 * @example
 * ```tsx
 * <Toggle label="Notifications" />
 * <Toggle checked={enabled} onChange={setEnabled} />
 * <Toggle size="lg" label="Dark Mode" defaultChecked />
 * ```
 */
const Toggle: React.FC<ToggleProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  size = 'md',
  className = '',
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const [animatedValue] = useState(new Animated.Value(defaultChecked ? 1 : 0))

  const isControlled = controlledChecked !== undefined
  const checked = isControlled ? controlledChecked : internalChecked

  const config = sizeConfig[size]

  // Animate thumb position when checked state changes
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: checked ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [checked, animatedValue])

  const handleToggle = () => {
    if (disabled) return

    const newChecked = !checked

    if (!isControlled) {
      setInternalChecked(newChecked)
    }

    onChange?.(newChecked)
  }

  // Interpolate from left padding (4px) to final position with right padding (4px)
  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [config.translateXOff, config.translateXOn],
  })

  const toggleButton = (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label || (checked ? 'Enabled' : 'Disabled')}
      className={`relative flex-row items-center rounded-full ${
        checked ? 'bg-primary' : 'bg-border'
      } ${disabled ? 'opacity-50' : 'active:opacity-90'} ${className}`}
      style={{
        width: config.containerWidth,
        height: config.containerHeight,
        overflow: 'hidden',
      }}
    >
      {/* Thumb - with explicit dimensions and transform */}
      <Animated.View
        className="bg-white rounded-full shadow-soft"
        style={{
          width: config.thumbSize,
          height: config.thumbSize,
          transform: [{ translateX: thumbTranslateX }],
        }}
      />
    </Pressable>
  )

  // If no label, return just the toggle
  if (!label) {
    return toggleButton
  }

  // With label, wrap in a container that matches web's label behavior
  return (
    <View className="flex-row items-center gap-3">
      {toggleButton}
      <Pressable
        onPress={handleToggle}
        disabled={disabled}
        className={disabled ? 'opacity-60' : ''}
      >
        <Text className={`font-medium text-text ${config.label}`}>{label}</Text>
      </Pressable>
    </View>
  )
}

export default Toggle
