import React from 'react'
import { View, Text } from 'react-native'
import { LoginForm } from '@/features/auth'
import KeyboardAwareScrollView from '@/components/ui/KeyboardAwareScrollView'
import { BrandLogo, BrandName } from '@/components/common/Brand'

/**
 * Index Screen - Login Page
 *
 * CRITICAL: This component does NOT handle auth redirects!
 *
 * Auth navigation is centralized in app/_layout.tsx via useProtectedRoute().
 * When login succeeds, the auth state changes and the root layout's
 * useProtectedRoute() hook will automatically redirect to (tabs).
 *
 * This prevents infinite redirect loops that occur when multiple components
 * compete to redirect based on auth state.
 */
export default function Index() {
  return (
    <KeyboardAwareScrollView
      centerContent
      contentContainerClassName="px-4 py-12"
      backgroundClass="bg-bg"
    >
      {/* Brand Section */}
      <View className="flex-row items-center justify-center gap-3 mb-8">
        <BrandLogo size="lg" />
        <BrandName />
      </View>

      {/* Header */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-headline text-center mb-2">
          Welcome Back
        </Text>
        <Text className="text-text text-center">
          Sign in to your account to continue
        </Text>
      </View>

      {/* Login Form */}
      <LoginForm />
    </KeyboardAwareScrollView>
  )
}
