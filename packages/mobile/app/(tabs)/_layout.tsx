import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/contexts/ThemeContext'

/**
 * Tab Layout for authenticated users
 *
 * CRITICAL: This component does NOT handle auth redirects!
 *
 * Auth navigation is centralized in app/_layout.tsx via useProtectedRoute().
 * This prevents infinite redirect loops that occur when multiple components
 * compete to redirect based on auth state.
 *
 * If a user somehow reaches this screen while not authenticated,
 * the root layout's auth guard will redirect them to login.
 */
export default function TabLayout() {
  const { getColor } = useTheme()
  const insets = useSafeAreaInsets()

  // Get theme colors for tab bar
  const primaryColor = getColor('primary')
  const mutedColor = getColor('muted')
  const surfaceColor = getColor('surface-1')
  const borderColor = getColor('border')

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: mutedColor,
        tabBarStyle: {
          backgroundColor: surfaceColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 8),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Hide task screens from tab bar - they're accessed via navigation */}
      <Tabs.Screen
        name="task/new"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="task/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}
