/**
 * Theme Color Utilities
 *
 * Utilities for converting CSS variable RGB triplet values
 * to usable color formats for React Native components.
 *
 * The themeVars.ts stores colors as RGB triplet strings (e.g., "37 99 235")
 * to match the CSS variable format used by NativeWind/Tailwind.
 * These utilities convert those values to formats usable by native components.
 *
 * @example
 * ```ts
 * import { toRgbString, toHex } from '@/utils/theme-colors.util';
 *
 * const triplet = "37 99 235";
 * toRgbString(triplet)      // "rgb(37, 99, 235)"
 * toRgbString(triplet, 0.5) // "rgba(37, 99, 235, 0.5)"
 * toHex(triplet)            // "#2563eb"
 * ```
 */

/**
 * RGB color components
 */
interface RgbComponents {
  r: number
  g: number
  b: number
}

/**
 * Parse RGB triplet string (e.g., "37 99 235") to RGB values
 *
 * @param triplet - Space-separated RGB values as string
 * @returns RGB components object or null if invalid
 *
 * @example
 * parseRgbTriplet("37 99 235") // { r: 37, g: 99, b: 235 }
 * parseRgbTriplet("invalid")   // null
 */
export const parseRgbTriplet = (triplet: string): RgbComponents | null => {
  if (!triplet || typeof triplet !== 'string') {
    return null
  }

  const parts = triplet.trim().split(/\s+/).map(Number)

  if (parts.length !== 3 || parts.some(isNaN)) {
    return null
  }

  const [r, g, b] = parts

  // Validate RGB range
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return null
  }

  return { r, g, b }
}

/**
 * Convert RGB triplet string to rgb() or rgba() string
 *
 * @param triplet - Space-separated RGB values (e.g., "37 99 235")
 * @param alpha - Optional alpha value (0-1)
 * @returns CSS rgb() or rgba() string
 *
 * @example
 * toRgbString("37 99 235")      // "rgb(37, 99, 235)"
 * toRgbString("37 99 235", 0.5) // "rgba(37, 99, 235, 0.5)"
 */
export const toRgbString = (triplet: string, alpha?: number): string => {
  const rgb = parseRgbTriplet(triplet)

  if (!rgb) {
    console.warn(`[theme-colors] Invalid RGB triplet: "${triplet}"`)
    return alpha !== undefined ? `rgba(0, 0, 0, ${alpha})` : 'rgb(0, 0, 0)'
  }

  const { r, g, b } = rgb

  if (alpha !== undefined && alpha >= 0 && alpha <= 1) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Convert RGB triplet string to hex color
 *
 * @param triplet - Space-separated RGB values (e.g., "37 99 235")
 * @returns Hex color string (e.g., "#2563eb")
 *
 * @example
 * toHex("37 99 235")  // "#2563eb"
 * toHex("255 255 255") // "#ffffff"
 */
export const toHex = (triplet: string): string => {
  const rgb = parseRgbTriplet(triplet)

  if (!rgb) {
    console.warn(`[theme-colors] Invalid RGB triplet: "${triplet}"`)
    return '#000000'
  }

  const { r, g, b } = rgb

  const toHexComponent = (value: number): string => {
    const clamped = Math.max(0, Math.min(255, Math.round(value)))
    return clamped.toString(16).padStart(2, '0')
  }

  return `#${toHexComponent(r)}${toHexComponent(g)}${toHexComponent(b)}`
}

/**
 * Normalize color key to CSS variable format
 *
 * Supports flexible key formats:
 * - Short form: 'primary' -> '--color-primary'
 * - Full form: '--color-primary' -> '--color-primary'
 * - With hyphens: 'surface-1' -> '--color-surface-1'
 * - With hyphens: 'on-primary' -> '--color-on-primary'
 *
 * @param key - Color key (short or full format)
 * @returns Normalized CSS variable name
 *
 * @example
 * normalizeColorKey('primary')        // '--color-primary'
 * normalizeColorKey('--color-primary') // '--color-primary'
 * normalizeColorKey('surface-1')      // '--color-surface-1'
 */
export const normalizeColorKey = (key: string): string => {
  if (!key || typeof key !== 'string') {
    return ''
  }

  const trimmedKey = key.trim()

  // Already in CSS variable format
  if (trimmedKey.startsWith('--')) {
    return trimmedKey
  }

  // Convert shorthand to full CSS variable name
  return `--color-${trimmedKey}`
}

/**
 * Get all available color keys from a theme vars object
 * Returns normalized short names (without '--color-' prefix)
 *
 * @param themeVars - Theme variables object
 * @returns Array of color key names
 *
 * @example
 * getColorKeys(lightThemeVars) // ['primary', 'on-primary', 'surface-1', ...]
 */
export const getColorKeys = (themeVars: Record<string, string>): string[] => {
  return Object.keys(themeVars)
    .filter((key) => key.startsWith('--color-'))
    .map((key) => key.replace('--color-', ''))
}
