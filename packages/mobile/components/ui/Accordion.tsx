import React, { useState, createContext, useContext, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

// ============================================================================
// Types
// ============================================================================

type AccordionContextValue = {
  expandedItems: Set<string>
  toggleItem: (value: string) => void
  allowMultiple: boolean
}

type AccordionItemContextValue = {
  value: string
  isExpanded: boolean
}

// ============================================================================
// Contexts
// ============================================================================

const AccordionContext = createContext<AccordionContextValue | undefined>(
  undefined,
)
const AccordionItemContext = createContext<
  AccordionItemContextValue | undefined
>(undefined)

const useAccordionContext = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion components must be used within Accordion.Root')
  }
  return context
}

const useAccordionItemContext = () => {
  const context = useContext(AccordionItemContext)
  if (!context) {
    throw new Error(
      'Accordion.Trigger/Content must be used within Accordion.Item',
    )
  }
  return context
}

// ============================================================================
// Root Component
// ============================================================================

export interface AccordionRootProps {
  children: React.ReactNode
  /**
   * Controlled expanded items
   */
  value?: string | string[]
  /**
   * Default expanded items (uncontrolled)
   */
  defaultValue?: string | string[]
  /**
   * Callback when expanded items change
   */
  onValueChange?: (value: string | string[]) => void
  /**
   * Allow multiple items to be expanded
   * @default false
   */
  allowMultiple?: boolean
  /**
   * Additional className for the container
   */
  className?: string
}

const AccordionRoot: React.FC<AccordionRootProps> = ({
  children,
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  allowMultiple = false,
  className = '',
}) => {
  const normalizeValue = (val: string | string[] | undefined): Set<string> => {
    if (!val) return new Set()
    return new Set(Array.isArray(val) ? val : [val])
  }

  const [internalValue, setInternalValue] = useState<Set<string>>(
    normalizeValue(defaultValue),
  )

  const isControlled = controlledValue !== undefined
  const expandedItems = isControlled
    ? normalizeValue(controlledValue)
    : internalValue

  const toggleItem = useCallback(
    (itemValue: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

      const newExpanded = new Set(expandedItems)

      if (newExpanded.has(itemValue)) {
        newExpanded.delete(itemValue)
      } else {
        if (!allowMultiple) {
          newExpanded.clear()
        }
        newExpanded.add(itemValue)
      }

      if (!isControlled) {
        setInternalValue(newExpanded)
      }

      const resultValue = allowMultiple
        ? Array.from(newExpanded)
        : newExpanded.size > 0
          ? Array.from(newExpanded)[0]
          : ''

      onValueChange?.(resultValue)
    },
    [expandedItems, isControlled, allowMultiple, onValueChange],
  )

  return (
    <AccordionContext.Provider
      value={{ expandedItems, toggleItem, allowMultiple }}
    >
      <View className={className}>{children}</View>
    </AccordionContext.Provider>
  )
}

// ============================================================================
// Item Component
// ============================================================================

export interface AccordionItemProps {
  children: React.ReactNode
  value: string
  className?: string
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  children,
  value,
  className = '',
}) => {
  const { expandedItems } = useAccordionContext()
  const isExpanded = expandedItems.has(value)

  return (
    <AccordionItemContext.Provider value={{ value, isExpanded }}>
      <View className={`border-b border-divider ${className}`}>{children}</View>
    </AccordionItemContext.Provider>
  )
}

// ============================================================================
// Trigger Component
// ============================================================================

export interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  showIcon?: boolean
}

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  className = '',
  showIcon = true,
}) => {
  const { toggleItem } = useAccordionContext()
  const { value, isExpanded } = useAccordionItemContext()

  return (
    <TouchableOpacity
      onPress={() => toggleItem(value)}
      className={`flex-row items-center justify-between py-4 ${className}`}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
    >
      <View className="flex-1">
        {typeof children === 'string' ? (
          <Text className="text-base font-medium text-headline">
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
      {showIcon && (
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#9CA3AF"
        />
      )}
    </TouchableOpacity>
  )
}

// ============================================================================
// Content Component
// ============================================================================

export interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className = '',
}) => {
  const { isExpanded } = useAccordionItemContext()

  if (!isExpanded) {
    return null
  }

  return <View className={`pb-4 ${className}`}>{children}</View>
}

// ============================================================================
// Compound Component Export
// ============================================================================

/**
 * Accordion - Collapsible content sections
 *
 * @example
 * ```tsx
 * <Accordion.Root defaultValue="item-1">
 *   <Accordion.Item value="item-1">
 *     <Accordion.Trigger>Section 1</Accordion.Trigger>
 *     <Accordion.Content>
 *       <Text>Content for section 1</Text>
 *     </Accordion.Content>
 *   </Accordion.Item>
 *   <Accordion.Item value="item-2">
 *     <Accordion.Trigger>Section 2</Accordion.Trigger>
 *     <Accordion.Content>
 *       <Text>Content for section 2</Text>
 *     </Accordion.Content>
 *   </Accordion.Item>
 * </Accordion.Root>
 * ```
 */
const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
}

export default Accordion
