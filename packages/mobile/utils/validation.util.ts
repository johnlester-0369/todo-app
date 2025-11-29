/**
 * Validation utility functions for forms
 */

/**
 * Check if a value is empty (null, undefined, empty string, or whitespace-only)
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  return false
}

/**
 * Validate email format using regex
 */
export const isValidEmail = (email: string): boolean => {
  if (isEmpty(email)) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 6)
 */
export const isValidPassword = (
  password: string,
  minLength: number = 6,
): boolean => {
  if (isEmpty(password)) return false
  return password.length >= minLength
}

/**
 * Validate username format
 * - 3-20 characters
 * - Only letters, numbers, and underscores
 */
export const isValidUsername = (username: string): boolean => {
  if (isEmpty(username)) return false
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username.trim())
}

/**
 * Check if two values match (e.g., password confirmation)
 */
export const doValuesMatch = (value1: string, value2: string): boolean => {
  return value1 === value2
}

/**
 * Validate name field
 * - Minimum 2 characters
 * - Only letters and spaces
 */
export const isValidName = (name: string): boolean => {
  if (isEmpty(name)) return false
  const nameRegex = /^[a-zA-Z\s]{2,}$/
  return nameRegex.test(name.trim())
}
