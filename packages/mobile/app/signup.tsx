import React from 'react'
import { View, Text } from 'react-native'
import { SignUpForm } from '@/features/auth'
import KeyboardAwareScrollView from '@/components/ui/KeyboardAwareScrollView'
import { BrandLogo, BrandName } from '@/components/common/Brand'

/**
 * Sign Up Screen
 *
 * Provides user registration with email, name, and password.
 * Uses the SignUpForm component for form handling.
 */
export default function SignUpScreen() {
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
          Create Account
        </Text>
        <Text className="text-text text-center">Sign up to get started</Text>
      </View>

      {/* Sign Up Form */}
      <SignUpForm />
    </KeyboardAwareScrollView>
  )
}
