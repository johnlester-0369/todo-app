import { useState, useCallback } from 'react'
import {
  isValidEmail,
  isValidPassword,
  isValidName,
  doValuesMatch,
  isEmpty,
} from '@/utils/validation.util'

/**
 * Field error state type
 */
export interface FieldErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

/**
 * Validation result for a single field
 */
interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * useAuthForm Hook
 *
 * Provides shared validation logic for authentication forms.
 * Used by both LoginForm and SignUpForm components.
 *
 * @example
 * ```tsx
 * const { errors, setErrors, validateEmail, validatePassword, clearFieldError } = useAuthForm();
 *
 * // Validate on blur
 * <Input onBlur={() => validateEmail(email)} error={errors.email} />
 * ```
 */
export function useAuthForm() {
  const [errors, setErrors] = useState<FieldErrors>({})

  /**
   * Clear a specific field error
   */
  const clearFieldError = useCallback((field: keyof FieldErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  /**
   * Validate email field
   */
  const validateEmail = useCallback((value: string): ValidationResult => {
    if (isEmpty(value)) {
      const error = 'Email is required'
      setErrors((prev) => ({ ...prev, email: error }))
      return { isValid: false, error }
    }
    if (!isValidEmail(value)) {
      const error = 'Please enter a valid email address'
      setErrors((prev) => ({ ...prev, email: error }))
      return { isValid: false, error }
    }
    setErrors((prev) => ({ ...prev, email: undefined }))
    return { isValid: true }
  }, [])

  /**
   * Validate password field
   */
  const validatePassword = useCallback((value: string): ValidationResult => {
    if (isEmpty(value)) {
      const error = 'Password is required'
      setErrors((prev) => ({ ...prev, password: error }))
      return { isValid: false, error }
    }
    if (!isValidPassword(value)) {
      const error = 'Password must be at least 6 characters'
      setErrors((prev) => ({ ...prev, password: error }))
      return { isValid: false, error }
    }
    setErrors((prev) => ({ ...prev, password: undefined }))
    return { isValid: true }
  }, [])

  /**
   * Validate name field
   */
  const validateName = useCallback((value: string): ValidationResult => {
    if (isEmpty(value)) {
      const error = 'Name is required'
      setErrors((prev) => ({ ...prev, name: error }))
      return { isValid: false, error }
    }
    if (!isValidName(value)) {
      const error =
        'Name must be at least 2 characters and contain only letters'
      setErrors((prev) => ({ ...prev, name: error }))
      return { isValid: false, error }
    }
    setErrors((prev) => ({ ...prev, name: undefined }))
    return { isValid: true }
  }, [])

  /**
   * Validate confirm password field
   */
  const validateConfirmPassword = useCallback(
    (password: string, confirmPassword: string): ValidationResult => {
      if (isEmpty(confirmPassword)) {
        const error = 'Please confirm your password'
        setErrors((prev) => ({ ...prev, confirmPassword: error }))
        return { isValid: false, error }
      }
      if (!doValuesMatch(password, confirmPassword)) {
        const error = 'Passwords do not match'
        setErrors((prev) => ({ ...prev, confirmPassword: error }))
        return { isValid: false, error }
      }
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
      return { isValid: true }
    },
    [],
  )

  return {
    errors,
    setErrors,
    clearFieldError,
    clearAllErrors,
    validateEmail,
    validatePassword,
    validateName,
    validateConfirmPassword,
  }
}

export type UseAuthFormReturn = ReturnType<typeof useAuthForm>
