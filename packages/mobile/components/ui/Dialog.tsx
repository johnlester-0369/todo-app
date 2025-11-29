import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  type ModalProps,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import CloseButton from './CloseButton'

// ============================================================================
// Types
// ============================================================================

type DialogContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  closeOnOverlayPress: boolean
}

// ============================================================================
// Context
// ============================================================================

const DialogContext = createContext<DialogContextValue | undefined>(undefined)

const useDialogContext = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'Dialog compound components must be used within Dialog.Root',
    )
  }
  return context
}

// ============================================================================
// Root Component
// ============================================================================

export interface DialogRootProps {
  children: React.ReactNode
  /**
   * Controlled open state
   */
  open?: boolean
  /**
   * Default open state (uncontrolled)
   * @default false
   */
  defaultOpen?: boolean
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void
  /**
   * Allow closing by pressing overlay
   * @default true
   */
  closeOnOverlayPress?: boolean
  /**
   * Modal animation type
   * @default 'slide'
   */
  animationType?: ModalProps['animationType']
}

const DialogRoot: React.FC<DialogRootProps> = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnOverlayPress = true,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const open = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(true)
    }
    onOpenChange?.(true)
  }, [isControlled, onOpenChange])

  const close = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(false)
    }
    onOpenChange?.(false)
  }, [isControlled, onOpenChange])

  const value: DialogContextValue = {
    isOpen,
    open,
    close,
    closeOnOverlayPress,
  }

  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  )
}

// ============================================================================
// Trigger Component
// ============================================================================

export interface DialogTriggerProps {
  children: React.ReactNode
  /**
   * Render as child component (clone child and add onPress)
   * @default false
   */
  asChild?: boolean
  className?: string
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({
  children,
  asChild = false,
  className,
}) => {
  const { open } = useDialogContext()

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<{
      onPress?: () => void
    }>

    return React.cloneElement(child, {
      onPress: () => {
        child.props.onPress?.()
        open()
      },
    })
  }

  return (
    <Pressable onPress={open} className={className}>
      {children}
    </Pressable>
  )
}

// ============================================================================
// Portal Component (Modal Wrapper)
// ============================================================================

export interface DialogPortalProps {
  children: React.ReactNode
  /**
   * Animation type for modal
   * @default 'slide'
   */
  animationType?: ModalProps['animationType']
}

const DialogPortal: React.FC<DialogPortalProps> = ({
  children,
  animationType = 'slide',
}) => {
  const { isOpen, close } = useDialogContext()
  const insets = useSafeAreaInsets()

  // Calculate keyboard vertical offset
  // Account for status bar on iOS, minimal on Android
  const keyboardVerticalOffset = Platform.select({
    ios: insets.top + (StatusBar.currentHeight ?? 0),
    android: StatusBar.currentHeight ?? 0,
    default: 0,
  })

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType={animationType}
      onRequestClose={close} // Android back button
      statusBarTranslucent // Allow content under status bar
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          {children}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ============================================================================
// Backdrop Component
// ============================================================================

export interface DialogBackdropProps {
  className?: string
}

const DialogBackdrop: React.FC<DialogBackdropProps> = ({ className = '' }) => {
  const { close, closeOnOverlayPress } = useDialogContext()

  return (
    <Pressable
      className={`absolute inset-0 bg-black/60 ${className}`}
      onPress={closeOnOverlayPress ? close : undefined}
      accessibilityRole="button"
      accessibilityLabel="Close dialog"
    />
  )
}

// ============================================================================
// Positioner Component
// ============================================================================

export interface DialogPositionerProps {
  children: React.ReactNode
  className?: string
}

const DialogPositioner: React.FC<DialogPositionerProps> = ({
  children,
  className = '',
}) => {
  const { close, closeOnOverlayPress } = useDialogContext()

  return (
    <Pressable
      style={{ flex: 1 }}
      className={`justify-center items-center px-4 ${className}`}
      onPress={closeOnOverlayPress ? close : undefined}
    >
      {/* 
        Inner Pressable prevents tap propagation to backdrop.
        CRITICAL: Must have w-full so Dialog.Content's w-full has a reference width.
        Without this, the dialog shrink-wraps to content instead of using max-w-* constraints.
      */}
      <Pressable
        className="w-full items-center"
        onPress={(e) => e.stopPropagation()}
      >
        {children}
      </Pressable>
    </Pressable>
  )
}

// ============================================================================
// Content Component
// ============================================================================

export interface DialogContentProps {
  children: React.ReactNode
  /**
   * Dialog size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-sm w-full',
  md: 'max-w-md w-full',
  lg: 'max-w-lg w-full',
  full: 'w-full mx-4',
} as const

const DialogContent: React.FC<DialogContentProps> = ({
  children,
  size = 'md',
  className = '',
}) => {
  return (
    <View
      className={`
        ${sizeClasses[size]}
        bg-surface-1
        rounded-xl
        shadow-lg
        border
        border-border
        overflow-hidden
        ${className}
      `}
    >
      {children}
    </View>
  )
}

// ============================================================================
// Close Trigger Component
// ============================================================================

export interface DialogCloseTriggerProps {
  children?: React.ReactNode
  asChild?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'solid' | 'danger'
}

const DialogCloseTrigger: React.FC<DialogCloseTriggerProps> = ({
  children,
  asChild = false,
  className = '',
  size = 'md',
  variant = 'ghost',
}) => {
  const { close } = useDialogContext()

  if (asChild && children) {
    const child = React.Children.only(children) as React.ReactElement<{
      onPress?: () => void
    }>

    return React.cloneElement(child, {
      onPress: () => {
        child.props.onPress?.()
        close()
      },
    })
  }

  // Default: Use CloseButton if no children provided
  if (!children) {
    return (
      <CloseButton
        onPress={close}
        size={size}
        variant={variant}
        className={className}
      />
    )
  }

  return (
    <Pressable onPress={close} className={className}>
      {children}
    </Pressable>
  )
}

// ============================================================================
// Header Component
// ============================================================================

export interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className = '',
}) => {
  return (
    <View
      className={`flex-row items-center justify-between px-6 py-4 border-b border-divider ${className}`}
    >
      {children}
    </View>
  )
}

// ============================================================================
// Title Component
// ============================================================================

export interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  className = '',
}) => {
  return (
    <Text
      className={`text-xl font-semibold text-headline flex-1 ${className}`}
      accessibilityRole="header"
    >
      {children}
    </Text>
  )
}

// ============================================================================
// Description Component
// ============================================================================

export interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  className = '',
}) => {
  return (
    <Text className={`text-sm text-muted mt-1 ${className}`}>{children}</Text>
  )
}

// ============================================================================
// Body Component
// ============================================================================

export interface DialogBodyProps {
  children: React.ReactNode
  className?: string
  /**
   * Enable scrolling for long content
   * @default true
   */
  scrollable?: boolean
}

const DialogBody: React.FC<DialogBodyProps> = ({
  children,
  className = '',
  scrollable = true,
}) => {
  const content = <View className={`px-6 py-4 ${className}`}>{children}</View>

  if (scrollable) {
    return (
      <ScrollView
        className="max-h-96"
        showsVerticalScrollIndicator={true}
        bounces={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={true}
      >
        {content}
      </ScrollView>
    )
  }

  return content
}

// ============================================================================
// Footer Component
// ============================================================================

export interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <View
      className={`flex-row items-center justify-end gap-3 px-6 py-4 border-t border-divider bg-surface-1 ${className}`}
    >
      {children}
    </View>
  )
}

// ============================================================================
// Compound Component Export
// ============================================================================

/**
 * Dialog - Mobile-optimized modal dialog component
 *
 * Features:
 * - Native Modal with animations
 * - Safe area support
 * - Keyboard avoidance with proper offset calculation
 * - Touch-optimized interactions
 * - Compound component pattern (same API as web)
 * - Scrollable content support with keyboard handling
 * - Controlled/uncontrolled modes
 *
 * @example
 * Basic Usage:
 * ```tsx
 * <Dialog.Root>
 *   <Dialog.Trigger>
 *     <Button>Open Dialog</Button>
 *   </Dialog.Trigger>
 *
 *   <Dialog.Portal>
 *     <Dialog.Backdrop />
 *     <Dialog.Positioner>
 *       <Dialog.Content>
 *         <Dialog.Header>
 *           <Dialog.Title>Dialog Title</Dialog.Title>
 *           <Dialog.CloseTrigger />
 *         </Dialog.Header>
 *
 *         <Dialog.Body>
 *           <Text>Dialog content here</Text>
 *         </Dialog.Body>
 *
 *         <Dialog.Footer>
 *           <Dialog.CloseTrigger asChild>
 *             <Button variant="ghost">Cancel</Button>
 *           </Dialog.CloseTrigger>
 *           <Button variant="primary">Confirm</Button>
 *         </Dialog.Footer>
 *       </Dialog.Content>
 *     </Dialog.Positioner>
 *   </Dialog.Portal>
 * </Dialog.Root>
 * ```
 *
 */
const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Backdrop: DialogBackdrop,
  Positioner: DialogPositioner,
  Content: DialogContent,
  CloseTrigger: DialogCloseTrigger,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Body: DialogBody,
  Footer: DialogFooter,
}

export default Dialog
