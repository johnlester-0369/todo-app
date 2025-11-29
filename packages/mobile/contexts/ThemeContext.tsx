import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from 'react'
import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { lightThemeVars, darkThemeVars, getThemeVars } from '@/styles/themeVars'
import {
  toRgbString,
  toHex,
  normalizeColorKey,
} from '@/utils/theme-colors.util'

/**
 * Color format options for getColor function
 */
type ColorFormat = 'rgb' | 'hex' | 'raw'

/**
 * Theme context type definition
 *
 * Provides both NativeWind color scheme control and programmatic
 * access to theme color values for native components.
 */
interface ThemeContextType {
  /**
   * Current color scheme ('light' or 'dark')
   */
  colorScheme: 'light' | 'dark'

  /**
   * Set the color scheme manually
   */
  setColorScheme: (scheme: 'light' | 'dark') => void

  /**
   * Toggle between light and dark mode
   */
  toggleColorScheme: () => void

  /**
   * Convenience boolean for dark mode check
   */
  isDark: boolean

  /**
   * Raw theme variables object for current scheme
   * Keys are CSS variable names (e.g., '--color-primary')
   * Values are RGB triplet strings (e.g., '37 99 235')
   *
   * This object is flexible - any keys present in themeVars.ts
   * will be available here, allowing future additions.
   */
  themeVars: Record<string, string>

  /**
   * Get a color value by key with automatic format conversion
   *
   * @param key - Color key (e.g., 'primary', 'error', 'surface-1', or '--color-primary')
   * @param format - Output format: 'rgb' (default), 'hex', or 'raw'
   * @returns Formatted color string
   *
   * @example
   * getColor('primary')           // 'rgb(37, 99, 235)'
   * getColor('primary', 'hex')    // '#2563eb'
   * getColor('primary', 'raw')    // '37 99 235'
   * getColor('on-primary')        // 'rgb(255, 255, 255)'
   * getColor('--color-error')     // 'rgb(239, 68, 68)' (full key also works)
   */
  getColor: (key: string, format?: ColorFormat) => string

  /**
   * Get a color with alpha transparency
   *
   * @param key - Color key
   * @param alpha - Alpha value (0-1)
   * @returns RGBA color string
   *
   * @example
   * getColorWithAlpha('primary', 0.5) // 'rgba(37, 99, 235, 0.5)'
   */
  getColorWithAlpha: (key: string, alpha: number) => string
}

/**
 * Create theme context
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Hook to access theme context
 *
 * @throws {Error} If used outside ThemeProvider
 *
 * @example
 * ```tsx
 * const { isDark, getColor, toggleColorScheme } = useTheme();
 *
 * // Use in native components
 * <Ionicons name="home" size={24} color={getColor('primary')} />
 * <View style={{ backgroundColor: getColor('surface-1') }} />
 * ```
 */
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: ReactNode
}

/**
 * ThemeProvider Component
 *
 * Provides theme management using NativeWind v4's built-in colorScheme API
 * with programmatic access to theme color values for native components.
 *
 * ## Features
 * - Automatic system theme support via CSS media queries (NativeWind)
 * - Manual theme override with toggle
 * - Programmatic color access for native components (icons, spinners, etc.)
 * - Flexible key access (supports any key from themeVars.ts)
 * - Multiple output formats (rgb, hex, raw)
 *
 * ## How Colors Work
 *
 * **For Tailwind/NativeWind classes:** Use standard Tailwind classes like
 * `bg-primary`, `text-error`, etc. NativeWind handles these via CSS variables.
 *
 * **For native components:** Use `getColor()` to get resolved color values:
 * - Icons: `<Ionicons color={getColor('primary')} />`
 * - Spinners: `<ActivityIndicator color={getColor('error')} />`
 * - Custom styles: `style={{ borderColor: getColor('border') }}`
 *
 * ## Key Flexibility
 *
 * The themeVars object uses `Record<string, string>` type, allowing any keys.
 * When new colors are added to themeVars.ts, they're automatically available
 * through `getColor()` without any TypeScript changes.
 *
 * @example
 * ```tsx
 * // In _layout.tsx
 * <ThemeProvider>
 *   <YourApp />
 * </ThemeProvider>
 *
 * // In any component
 * const { isDark, toggleColorScheme, getColor } = useTheme();
 *
 * // Toggle theme
 * <Toggle checked={isDark} onChange={toggleColorScheme} />
 *
 * // Use colors in native components
 * <Ionicons name="alert" color={getColor('error')} />
 * <ActivityIndicator color={getColor('primary')} />
 *
 * // Different formats
 * getColor('primary')           // 'rgb(37, 99, 235)' - for most cases
 * getColor('primary', 'hex')    // '#2563eb' - when hex is needed
 * getColor('primary', 'raw')    // '37 99 235' - raw triplet
 *
 * // With alpha
 * getColorWithAlpha('primary', 0.5) // 'rgba(37, 99, 235, 0.5)'
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Use NativeWind's built-in colorScheme hook
  const { colorScheme, setColorScheme, toggleColorScheme } =
    useNativeWindColorScheme()

  // Derive isDark from colorScheme
  const isDark = colorScheme === 'dark'

  // Get current theme variables based on color scheme
  // This automatically switches when colorScheme changes
  const themeVars = useMemo(() => {
    return getThemeVars(colorScheme ?? 'light')
  }, [colorScheme])

  /**
   * Get a color value by key with format conversion
   * Memoized to prevent unnecessary recalculations
   */
  const getColor = useCallback(
    (key: string, format: ColorFormat = 'rgb'): string => {
      const normalizedKey = normalizeColorKey(key)
      const value = themeVars[normalizedKey]

      if (!value) {
        // Log warning in development to help catch typos
        if (__DEV__) {
          console.warn(
            `[ThemeContext] Color not found: "${key}" (normalized: "${normalizedKey}")\n` +
              `Available keys: ${Object.keys(themeVars).slice(0, 5).join(', ')}...`,
          )
        }

        // Return sensible fallbacks based on format
        switch (format) {
          case 'hex':
            return '#000000'
          case 'raw':
            return '0 0 0'
          default:
            return 'rgb(0, 0, 0)'
        }
      }

      // Convert to requested format
      switch (format) {
        case 'hex':
          return toHex(value)
        case 'raw':
          return value
        default:
          return toRgbString(value)
      }
    },
    [themeVars],
  )

  /**
   * Get a color with alpha transparency
   */
  const getColorWithAlpha = useCallback(
    (key: string, alpha: number): string => {
      const normalizedKey = normalizeColorKey(key)
      const value = themeVars[normalizedKey]

      if (!value) {
        if (__DEV__) {
          console.warn(`[ThemeContext] Color not found: "${key}"`)
        }
        return `rgba(0, 0, 0, ${alpha})`
      }

      return toRgbString(value, alpha)
    },
    [themeVars],
  )

  // Memoize the entire context value to prevent unnecessary re-renders
  const value: ThemeContextType = useMemo(
    () => ({
      colorScheme: colorScheme ?? 'light',
      setColorScheme,
      toggleColorScheme,
      isDark,
      themeVars,
      getColor,
      getColorWithAlpha,
    }),
    [
      colorScheme,
      setColorScheme,
      toggleColorScheme,
      isDark,
      themeVars,
      getColor,
      getColorWithAlpha,
    ],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export type { ThemeContextType, ColorFormat }
