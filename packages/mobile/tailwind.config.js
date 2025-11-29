/** @type {import('tailwindcss').Config} */
module.exports = {
  // CRITICAL: Remove darkMode setting for NativeWind v4 system theme support
  // NativeWind v4 defaults to media queries which is what we want
  // darkMode: 'class', // ❌ DON'T DO THIS - breaks system theme support

  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],

  theme: {
    extend: {
      colors: {
        // Core semantic colors (using CSS variables)
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',

        // Backgrounds - hierarchical
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        'surface-1': 'rgb(var(--color-surface-1) / <alpha-value>)',
        'surface-2': 'rgb(var(--color-surface-2) / <alpha-value>)',
        'surface-hover-1': 'rgb(var(--color-surface-hover-1) / <alpha-value>)',
        'surface-hover-2': 'rgb(var(--color-surface-hover-2) / <alpha-value>)',

        // Text colors
        text: 'rgb(var(--color-text) / <alpha-value>)',
        headline: 'rgb(var(--color-headline) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',

        // UI elements
        border: 'rgb(var(--color-border) / <alpha-value>)',
        divider: 'rgb(var(--color-divider) / <alpha-value>)',

        // Feedback colors
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        // Custom shadows matching web implementation
        soft: '0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'soft-md':
          '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'soft-lg':
          '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'soft-xl':
          '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
}
