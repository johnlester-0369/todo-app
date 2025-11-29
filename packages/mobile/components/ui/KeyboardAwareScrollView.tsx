import React, { useState, useEffect } from 'react'
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ViewStyle,
  ScrollViewProps,
  KeyboardAvoidingViewProps,
  Keyboard,
  EmitterSubscription,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface KeyboardAwareScrollViewProps extends Omit<
  ScrollViewProps,
  'style'
> {
  /**
   * Children to render inside the scroll view
   */
  children: React.ReactNode

  /**
   * Background color class for the container (NativeWind)
   * @default 'bg-bg'
   */
  backgroundClass?: string

  /**
   * Content container class name (NativeWind)
   */
  contentContainerClassName?: string

  /**
   * Additional style for content container
   */
  contentContainerStyle?: ViewStyle

  /**
   * Whether content should be centered vertically
   * @default false
   */
  centerContent?: boolean

  /**
   * Keyboard avoiding view behavior override
   */
  behavior?: KeyboardAvoidingViewProps['behavior']

  /**
   * Additional keyboard vertical offset
   * @default 0
   */
  extraKeyboardOffset?: number

  /**
   * Whether to use safe area padding at bottom
   * @default true
   */
  useSafeAreaBottom?: boolean
}

/**
 * KeyboardAwareScrollView - A reusable component that properly handles
 * keyboard appearance on both iOS and Android.
 *
 * Features:
 * - Automatic keyboard avoidance with proper offset calculation
 * - Safe area support with keyboard state awareness
 * - Centered content option for forms
 * - Consistent behavior across platforms
 * - NativeWind styling support
 * - Proper cleanup when keyboard dismisses (no white space)
 *
 * @example
 * ```tsx
 * // Basic usage for forms
 * <KeyboardAwareScrollView centerContent>
 *   <Input label="Email" />
 *   <Input label="Password" />
 *   <Button>Submit</Button>
 * </KeyboardAwareScrollView>
 *
 * // With custom styling
 * <KeyboardAwareScrollView
 *   contentContainerClassName="px-4 py-8"
 *   backgroundClass="bg-surface-1"
 * >
 *   {children}
 * </KeyboardAwareScrollView>
 * ```
 */
const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({
  children,
  backgroundClass = 'bg-bg',
  contentContainerClassName = '',
  contentContainerStyle,
  centerContent = false,
  behavior,
  extraKeyboardOffset = 0,
  useSafeAreaBottom = true,
  ...scrollViewProps
}) => {
  const insets = useSafeAreaInsets()
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  // Track keyboard visibility to properly manage safe area padding
  useEffect(() => {
    const subscriptions: EmitterSubscription[] = []

    // Use 'will' events on iOS for smoother animations, 'did' events on Android
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true)
    })
    subscriptions.push(showSubscription)

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false)
    })
    subscriptions.push(hideSubscription)

    return () => {
      subscriptions.forEach((subscription) => subscription.remove())
    }
  }, [])

  // Calculate keyboard vertical offset
  // iOS: Use top safe area inset for proper header/notch handling
  // Android: Use extra offset only (system handles most cases)
  const keyboardVerticalOffset = Platform.select({
    ios: insets.top + extraKeyboardOffset,
    android: extraKeyboardOffset,
    default: 0,
  })

  // Determine KeyboardAvoidingView behavior
  // Using 'padding' for both platforms for consistent and reliable behavior
  // 'height' on Android can sometimes not properly resize back
  const keyboardBehavior = behavior ?? 'padding'

  // Build content container style
  // Only apply bottom safe area padding when keyboard is NOT visible
  // This prevents white space from remaining after keyboard dismisses
  const computedContentContainerStyle: ViewStyle = {
    flexGrow: 1,
    ...(centerContent && {
      justifyContent: 'center',
    }),
    ...(useSafeAreaBottom &&
      !isKeyboardVisible && {
        paddingBottom: insets.bottom,
      }),
    ...contentContainerStyle,
  }

  return (
    <KeyboardAvoidingView
      behavior={keyboardBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={{ flex: 1 }}
      className={backgroundClass}
    >
      <ScrollView
        contentContainerStyle={computedContentContainerStyle}
        contentContainerClassName={contentContainerClassName}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        bounces={true}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default KeyboardAwareScrollView
