/**
 * Utility functions for common operations
 */

/**
 * Check if a string is empty or contains only whitespace
 */
export function isEmpty(value: string | undefined | null): boolean {
  return !value || value.trim().length === 0
}

/**
 * Sanitize string by trimming whitespace
 */
export function sanitizeString(value: string | undefined | null): string {
  return value?.trim() || ''
}

/**
 * Debounce function for search inputs
 */
export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  delay: number,
): (...args: TArgs) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: TArgs) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}
