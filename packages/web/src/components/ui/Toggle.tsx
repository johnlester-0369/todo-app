import React, { useState } from 'react'

type ToggleSize = 'sm' | 'md' | 'lg'

export interface ToggleProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  size?: ToggleSize
  id?: string
  name?: string
  className?: string
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

// Size configurations for the toggle switch
const sizeConfig = {
  sm: {
    container: 'w-9 h-5',
    thumb: 'w-3 h-3',
    translate: 'translate-x-5',
    label: 'text-sm',
  },
  md: {
    container: 'w-11 h-6',
    thumb: 'w-4 h-4',
    translate: 'translate-x-6',
    label: 'text-base',
  },
  lg: {
    container: 'w-14 h-7',
    thumb: 'w-5 h-5',
    translate: 'translate-x-8',
    label: 'text-lg',
  },
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      disabled = false,
      label,
      size = 'md',
      id,
      name,
      className,
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked)

    const isControlled = controlledChecked !== undefined
    const checked = isControlled ? controlledChecked : internalChecked

    const generatedId = React.useId()
    const toggleId = id || `toggle-${generatedId}`

    const config = sizeConfig[size]

    const handleToggle = () => {
      if (disabled) return

      const newChecked = !checked

      if (!isControlled) {
        setInternalChecked(newChecked)
      }

      onChange?.(newChecked)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return

      // Support Space and Enter keys
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleToggle()
      }
    }

    const toggleButton = (
      <button
        ref={ref}
        type="button"
        role="switch"
        id={toggleId}
        name={name}
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface-2',
          config.container,
          checked ? 'bg-primary' : 'bg-border',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:opacity-90',
          className,
        )}
      >
        <span className="sr-only">
          {label || (checked ? 'Enabled' : 'Disabled')}
        </span>

        {/* Thumb */}
        <span
          className={cn(
            'inline-block bg-white rounded-full shadow-soft transition-transform duration-200 ease-in-out transform',
            config.thumb,
            checked ? config.translate : 'translate-x-1',
          )}
          aria-hidden="true"
        />
      </button>
    )

    // If no label, return just the toggle
    if (!label) {
      return toggleButton
    }

    // With label, wrap in a label element for better UX
    return (
      <label
        htmlFor={toggleId}
        className={cn(
          'inline-flex items-center gap-3',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        )}
      >
        {toggleButton}
        <span className={cn('font-medium text-text select-none', config.label)}>
          {label}
        </span>
      </label>
    )
  },
)

Toggle.displayName = 'Toggle'

export default Toggle
