import React, { createContext, useContext, useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'

// ============================================================================
// Types
// ============================================================================

type TabsContextValue = {
  value: string
  onChange: (value: string) => void
  orientation: 'horizontal' | 'vertical'
  variant: TabsVariant
}

type TabsOrientation = 'horizontal' | 'vertical'
type TabsVariant =
  | 'line'
  | 'enclosed'
  | 'enclosed-colored'
  | 'soft-rounded'
  | 'solid-rounded'
  | 'unstyled'

// ============================================================================
// Context
// ============================================================================

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs compound components must be used within Tabs.Root')
  }
  return context
}

// ============================================================================
// Root Component
// ============================================================================

export interface TabsRootProps {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  orientation?: TabsOrientation
  className?: string
}

const TabsRoot: React.FC<TabsRootProps> = ({
  children,
  value: controlledValue,
  defaultValue = '',
  onChange,
  orientation = 'horizontal',
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [variant, setVariant] = useState<TabsVariant>('line')

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  // Clone children to inject variant setter
  const childrenWithVariant = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === TabsList) {
      return React.cloneElement(child, {
        onVariantChange: setVariant,
      } as Partial<TabsListProps>)
    }
    return child
  })

  const contextValue: TabsContextValue = {
    value,
    onChange: handleChange,
    orientation,
    variant,
  }

  return (
    <TabsContext.Provider value={contextValue}>
      <View
        className={`${
          orientation === 'vertical' ? 'flex-row gap-6' : ''
        } ${className}`}
      >
        {childrenWithVariant}
      </View>
    </TabsContext.Provider>
  )
}

TabsRoot.displayName = 'Tabs.Root'

// ============================================================================
// TabsList Component
// ============================================================================

export interface TabsListProps {
  children: React.ReactNode
  variant?: TabsVariant
  className?: string
  onVariantChange?: (variant: TabsVariant) => void
}

const variantClasses: Record<TabsVariant, string> = {
  line: 'border-b border-divider',
  enclosed: 'bg-surface-1 p-1 rounded-lg border border-border',
  'enclosed-colored': 'bg-surface-1 p-1 rounded-lg border border-border',
  'soft-rounded': 'bg-surface-1/50 p-1 rounded-full',
  'solid-rounded': 'bg-surface-1 p-1 rounded-full',
  unstyled: '',
}

const TabsList: React.FC<TabsListProps> = ({
  children,
  variant = 'line',
  className = '',
  onVariantChange,
}) => {
  const { orientation } = useTabsContext()

  // Notify parent about variant on mount and when it changes
  React.useEffect(() => {
    onVariantChange?.(variant)
  }, [variant, onVariantChange])

  return (
    <ScrollView
      horizontal={orientation === 'horizontal'}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerClassName={`flex ${
        orientation === 'vertical' ? 'flex-col' : 'flex-row'
      } ${
        variant === 'line' && orientation === 'horizontal' ? 'gap-6' : ''
      } ${variant === 'line' && orientation === 'vertical' ? 'gap-2' : ''} ${
        variant === 'enclosed' || variant === 'enclosed-colored' ? 'gap-1' : ''
      } ${
        variant === 'soft-rounded' || variant === 'solid-rounded' ? 'gap-1' : ''
      } ${variant === 'unstyled' ? 'gap-2' : ''} ${
        variantClasses[variant]
      } ${className}`}
    >
      {children}
    </ScrollView>
  )
}

TabsList.displayName = 'Tabs.List'

// ============================================================================
// Tab Component
// ============================================================================

export interface TabProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

const Tab: React.FC<TabProps> = ({
  value: tabValue,
  children,
  disabled = false,
  icon,
  className = '',
}) => {
  const { value, onChange, variant } = useTabsContext()
  const isActive = value === tabValue

  const handlePress = () => {
    if (!disabled) {
      onChange(tabValue)
    }
  }

  // Base styles that apply to all variants
  const baseStyles = `relative flex-row items-center gap-2 px-4 py-2 ${
    disabled ? 'opacity-40' : ''
  }`

  // Variant-specific styles
  const variantStyles = {
    line: `${isActive ? 'border-b-2 border-headline' : ''} ${
      isActive ? 'bg-surface-hover-1' : ''
    } rounded-t-lg`,
    enclosed: `rounded-md ${
      isActive ? 'bg-surface-2 shadow-soft' : 'active:bg-surface-hover-1'
    }`,
    'enclosed-colored': `rounded-md ${
      isActive ? 'bg-primary' : 'active:bg-surface-hover-1'
    }`,
    'soft-rounded': `rounded-full ${
      isActive ? 'bg-surface-2 shadow-soft' : 'active:bg-surface-hover-1'
    }`,
    'solid-rounded': `rounded-full ${
      isActive ? 'bg-primary' : 'active:bg-surface-hover-1'
    }`,
    unstyled: '',
  }

  const textStyles = {
    line: isActive ? 'text-headline' : 'text-muted',
    enclosed: isActive ? 'text-headline' : 'text-muted',
    'enclosed-colored': isActive ? 'text-on-primary' : 'text-muted',
    'soft-rounded': isActive ? 'text-headline' : 'text-muted',
    'solid-rounded': isActive ? 'text-on-primary' : 'text-muted',
    unstyled: isActive ? 'text-headline' : 'text-muted',
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive, disabled }}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {icon && <View>{icon}</View>}
      <Text className={`text-sm font-medium ${textStyles[variant]}`}>
        {children}
      </Text>
    </Pressable>
  )
}

Tab.displayName = 'Tabs.Tab'

// ============================================================================
// TabPanels Component
// ============================================================================

export interface TabPanelsProps {
  children: React.ReactNode
  className?: string
}

const TabPanels: React.FC<TabPanelsProps> = ({ children, className = '' }) => {
  return <View className={`mt-4 ${className}`}>{children}</View>
}

TabPanels.displayName = 'Tabs.Panels'

// ============================================================================
// TabPanel Component
// ============================================================================

export interface TabPanelProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabPanel: React.FC<TabPanelProps> = ({
  value: panelValue,
  children,
  className = '',
}) => {
  const { value } = useTabsContext()
  const isActive = value === panelValue

  if (!isActive) return null

  return <View className={`rounded-lg ${className}`}>{children}</View>
}

TabPanel.displayName = 'Tabs.Panel'

// ============================================================================
// Compound Component Export
// ============================================================================

const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: Tab,
  Panels: TabPanels,
  Panel: TabPanel,
}

export default Tabs
