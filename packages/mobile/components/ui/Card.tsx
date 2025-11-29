import React from 'react'
import { View, Text, ViewProps, TextProps, Pressable } from 'react-native'

// ============================================================================
// Types
// ============================================================================

type CardVariant = 'default' | 'elevated' | 'bordered' | 'ghost' | 'unstyled'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

// ============================================================================
// Root Component
// ============================================================================

export interface CardRootProps extends ViewProps {
  variant?: CardVariant
  padding?: CardPadding
  interactive?: boolean
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-surface-2 rounded-lg',
  elevated: 'bg-surface-2 rounded-lg shadow-md',
  bordered: 'bg-surface-1 border-2 border-border rounded-lg',
  ghost: 'bg-transparent border border-transparent rounded-lg',
  unstyled: '',
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const CardRoot = React.forwardRef<View, CardRootProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const computedClass = `
      ${variantClasses[variant]}
      ${padding !== 'none' ? paddingClasses[padding] : ''}
      ${className}
    `.trim()

    if (interactive) {
      return (
        <Pressable
          ref={ref as any}
          className={`${computedClass} active:opacity-90`}
          {...props}
        >
          {children}
        </Pressable>
      )
    }

    return (
      <View ref={ref} className={computedClass} {...props}>
        {children}
      </View>
    )
  },
)

CardRoot.displayName = 'Card.Root'

// ============================================================================
// Header Component
// ============================================================================

export interface CardHeaderProps extends ViewProps {
  withDivider?: boolean
  className?: string
}

const CardHeader = React.forwardRef<View, CardHeaderProps>(
  ({ withDivider = false, className = '', children, ...props }, ref) => {
    const computedClass = `
      flex-row items-start justify-between
      ${withDivider ? 'pb-4 mb-4 border-b border-divider' : 'mb-4'}
      ${className}
    `.trim()

    return (
      <View ref={ref} className={computedClass} {...props}>
        {children}
      </View>
    )
  },
)

CardHeader.displayName = 'Card.Header'

// ============================================================================
// Title Component
// ============================================================================

export interface CardTitleProps extends TextProps {
  /**
   * Note: 'as' prop for semantic heading levels is not applicable in React Native.
   * This prop is kept for API consistency with web but has no effect.
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
}

const CardTitle = React.forwardRef<Text, CardTitleProps>(
  ({ as, className = '', children, ...props }, ref) => {
    const computedClass = `
      text-xl font-semibold text-headline
      ${className}
    `.trim()

    return (
      <Text ref={ref} className={computedClass} {...props}>
        {children}
      </Text>
    )
  },
)

CardTitle.displayName = 'Card.Title'

// ============================================================================
// Description Component
// ============================================================================

export type CardDescriptionProps = TextProps & {
  className?: string
}

const CardDescription = React.forwardRef<Text, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    const computedClass = `
      text-sm text-muted mt-1.5
      ${className}
    `.trim()

    return (
      <Text ref={ref} className={computedClass} {...props}>
        {children}
      </Text>
    )
  },
)

CardDescription.displayName = 'Card.Description'

// ============================================================================
// Body Component
// ============================================================================

export type CardBodyProps = ViewProps & {
  className?: string
}

const CardBody = React.forwardRef<View, CardBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    const computedClass = `
      ${className}
    `.trim()

    return (
      <View ref={ref} className={computedClass} {...props}>
        {children}
      </View>
    )
  },
)

CardBody.displayName = 'Card.Body'

// ============================================================================
// Footer Component
// ============================================================================

export interface CardFooterProps extends ViewProps {
  withDivider?: boolean
  align?: 'left' | 'center' | 'right' | 'between'
  className?: string
}

const alignClasses: Record<NonNullable<CardFooterProps['align']>, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
}

const CardFooter = React.forwardRef<View, CardFooterProps>(
  (
    {
      withDivider = false,
      align = 'right',
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const computedClass = `
      flex-row items-center gap-3
      ${alignClasses[align]}
      ${withDivider ? 'pt-4 mt-4 border-t border-divider' : 'mt-4'}
      ${className}
    `.trim()

    return (
      <View ref={ref} className={computedClass} {...props}>
        {children}
      </View>
    )
  },
)

CardFooter.displayName = 'Card.Footer'

// ============================================================================
// Compound Component Export
// ============================================================================

const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Body: CardBody,
  Footer: CardFooter,
}

export default Card
