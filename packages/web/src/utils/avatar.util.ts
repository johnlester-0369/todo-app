/**
 * Avatar and User Display Utilities
 *
 * Utilities for generating user initials, handling avatar fallbacks,
 * and displaying user information consistently across the application.
 */

/**
 * Generate initials from a user's name
 *
 * @param name - Full name of the user
 * @returns Initials (1-2 characters, uppercase)
 *
 * @example
 * getInitials('John Doe') // Returns 'JD'
 * getInitials('Alice') // Returns 'A'
 * getInitials('') // Returns 'U'
 */
export function getInitials(name: string | undefined | null): string {
  // Handle empty or invalid names
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return 'U'
  }

  const trimmedName = name.trim()
  const names = trimmedName.split(' ').filter((n) => n.length > 0)

  // If multiple names, use first letter of first two words
  if (names.length >= 2) {
    return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
  }

  // If single name, use first letter
  return trimmedName.charAt(0).toUpperCase()
}

/**
 * Get display name with fallback
 *
 * @param name - User's name (optional)
 * @param fallback - Fallback text (default: 'User')
 * @returns Display name or fallback
 */
export function getDisplayName(
  name: string | undefined | null,
  fallback = 'User',
): string {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return fallback
  }
  return name.trim()
}

/**
 * Get display email with fallback
 *
 * @param email - User's email (optional)
 * @param fallback - Fallback text (default: 'user@example.com')
 * @returns Display email or fallback
 */
export function getDisplayEmail(
  email: string | undefined | null,
  fallback = 'user@example.com',
): string {
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return fallback
  }
  return email.trim()
}

/**
 * Check if avatar image should be displayed
 *
 * @param imageUrl - Avatar image URL
 * @param hasError - Whether image failed to load
 * @returns True if image should be shown
 */
export function shouldShowAvatar(
  imageUrl: string | undefined | null,
  hasError: boolean,
): boolean {
  return Boolean(imageUrl) && !hasError
}
