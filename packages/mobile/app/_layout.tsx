import { useEffect, useRef } from 'react'
import {
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
} from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import '@/styles/global.css'
import { UserAuthProvider, useUserAuth } from '@/contexts/UserAuthContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'

/**
 * Auth Navigation Guard
 *
 * CRITICAL: This is the ONLY place that handles auth-based navigation.
 * Having auth redirects in multiple places (index.tsx, (tabs)/_layout.tsx)
 * causes infinite redirect loops due to competing navigation attempts.
 *
 * How it works:
 * 1. Uses useSegments() to detect which route group user is in
 * 2. Uses useRootNavigationState() to ensure navigation is ready
 * 3. Redirects based on auth state ONCE, with proper guards
 *
 * Navigation Rules:
 * - Authenticated + on login/signup → redirect to (tabs)
 * - Not authenticated + on (tabs) → redirect to /
 */
function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useUserAuth()
  const segments = useSegments()
  const router = useRouter()
  const navigationState = useRootNavigationState()

  // Track if we've initiated navigation to prevent duplicate redirects
  const isNavigatingRef = useRef(false)

  useEffect(() => {
    // Don't navigate while auth is loading
    if (isLoading) {
      isNavigatingRef.current = false
      return
    }

    // Don't navigate until navigation is ready
    if (!navigationState?.key) {
      return
    }

    // Prevent concurrent navigation attempts
    if (isNavigatingRef.current) {
      return
    }

    // Determine which route group the user is in
    const inTabsGroup = segments[0] === '(tabs)'
    const onAuthScreens = segments[0] === undefined || segments[0] === 'signup'

    if (isAuthenticated && onAuthScreens) {
      // User is authenticated but on login/signup screens
      // Redirect to the main app
      console.log('🔐 Auth guard: Redirecting authenticated user to tabs')
      isNavigatingRef.current = true
      router.replace('/(tabs)')
    } else if (!isAuthenticated && inTabsGroup) {
      // User is not authenticated but trying to access protected routes
      // Redirect to login
      console.log('🔐 Auth guard: Redirecting unauthenticated user to login')
      isNavigatingRef.current = true
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, segments, navigationState?.key, router])

  // Reset navigation lock when auth state changes
  useEffect(() => {
    // Small delay to ensure navigation completes before resetting
    const timer = setTimeout(() => {
      isNavigatingRef.current = false
    }, 100)
    return () => clearTimeout(timer)
  }, [isAuthenticated])
}

/**
 * Root Layout Content
 *
 * Wrapped separately to access theme and auth context after provider initialization.
 */
function RootLayoutContent() {
  const { colorScheme, isDark } = useTheme()
  const { isLoading } = useUserAuth()
  const navigationState = useRootNavigationState()

  // Centralized auth navigation guard
  useProtectedRoute()

  // Show loading screen while:
  // 1. Auth state is being determined
  // 2. Navigation state is not yet ready
  if (isLoading || !navigationState?.key) {
    return (
      <View
        className="flex-1 items-center justify-center bg-bg"
        style={{
          // @ts-ignore - colorScheme is valid for NativeWind
          colorScheme: colorScheme,
        }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? '#06B6FF' : '#006EBE'}
        />
      </View>
    )
  }

  return (
    <View
      className="flex-1"
      style={{
        // @ts-ignore - colorScheme is valid for NativeWind
        colorScheme: colorScheme,
      }}
    >
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? '#081023' : '#ECF3FE',
          },
          headerTintColor: isDark ? '#EBF5FF' : '#051432',
          contentStyle: {
            backgroundColor: isDark ? '#020612' : '#E8F0FC',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Home',
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: 'Sign Up',
            headerShown: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            title: 'My Tasks',
          }}
        />
      </Stack>
    </View>
  )
}

/**
 * Root Layout
 *
 * ARCHITECTURE NOTES:
 *
 * Auth Navigation Strategy:
 * - ALL auth-based redirects happen in useProtectedRoute() hook above
 * - Individual screens (index.tsx, (tabs)/_layout.tsx) do NOT redirect
 * - This prevents the infinite loop caused by competing redirects
 *
 * Provider Order:
 * 1. ThemeProvider (outer) - Provides color scheme
 * 2. UserAuthProvider (inner) - Provides auth state
 *
 * The RootLayoutContent component handles:
 * - Auth navigation via useProtectedRoute()
 * - Loading states while auth initializes
 * - Theme propagation via colorScheme prop
 */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserAuthProvider>
        <RootLayoutContent />
      </UserAuthProvider>
    </ThemeProvider>
  )
}
