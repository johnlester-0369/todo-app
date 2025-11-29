import React, { useState, useCallback } from 'react'
import { View, Text, Pressable, Alert as RNAlert } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { authUserClient } from '@/lib/auth-client'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuthForm } from '@/features/auth/hooks'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'

/**
 * Sign Up Form Data Interface
 */
interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

/**
 * SignUpForm Component
 *
 * Renders the signup form with name, email, password, and confirm password fields.
 * Handles comprehensive validation and account creation.
 *
 * @example
 * ```tsx
 * <SignUpForm />
 * ```
 */
export function SignUpForm() {
  const router = useRouter()
  const { getColor } = useTheme()
  const {
    errors,
    validateName,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    clearFieldError,
  } = useAuthForm()

  // Theme colors for native components
  const onPrimaryColor = getColor('on-primary')
  const mutedColor = getColor('muted')

  // Form state
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [signUpError, setSignUpError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /**
   * Validate all form fields
   */
  const validateForm = useCallback((): boolean => {
    const isNameValid = validateName(formData.name).isValid
    const isEmailValid = validateEmail(formData.email).isValid
    const isPasswordValid = validatePassword(formData.password).isValid
    const isConfirmPasswordValid = validateConfirmPassword(
      formData.password,
      formData.confirmPassword,
    ).isValid

    return (
      isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid
    )
  }, [
    formData,
    validateName,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
  ])

  /**
   * Handle input change for any field
   */
  const handleInputChange = useCallback(
    (field: keyof SignUpFormData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))

      // Clear field error when user starts typing
      if (errors[field]) {
        clearFieldError(field)
      }

      // Clear general signup error
      if (signUpError) {
        setSignUpError('')
      }
    },
    [errors, signUpError, clearFieldError],
  )

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    setSignUpError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await authUserClient.signUp.email(
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        {
          onRequest: () => {
            console.log('🔄 Sign up request started')
          },
          onSuccess: () => {
            console.log('✅ Sign up successful')
          },
          onError: (ctx) => {
            console.error('❌ Sign up failed:', ctx.error)
          },
        },
      )

      if (error) {
        throw new Error(error.message || 'Sign up failed')
      }

      if (data) {
        // Show success and redirect to login
        RNAlert.alert(
          'Success',
          'Account created successfully! Please sign in.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/'),
            },
          ],
        )
      }
    } catch (error) {
      setSignUpError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [validateForm, formData, router])

  return (
    <Card.Root variant="unstyled">
      <View className="gap-6">
        {/* Error Alert */}
        {signUpError && (
          <Alert
            variant="error"
            title="Sign Up Failed"
            message={signUpError}
            onClose={() => setSignUpError('')}
          />
        )}

        {/* Name Input */}
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          onBlur={() => validateName(formData.name)}
          error={errors.name}
          variant={errors.name ? 'error' : 'default'}
          leftIcon={
            <Ionicons name="person-outline" size={20} color={mutedColor} />
          }
          autoCapitalize="words"
          editable={!isLoading}
          returnKeyType="next"
        />

        {/* Email Input */}
        <Input
          label="Email Address"
          placeholder="you@example.com"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          onBlur={() => validateEmail(formData.email)}
          error={errors.email}
          variant={errors.email ? 'error' : 'default'}
          leftIcon={
            <Ionicons name="mail-outline" size={20} color={mutedColor} />
          }
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
          returnKeyType="next"
        />

        {/* Password Input */}
        <Input
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChangeText={(text) => handleInputChange('password', text)}
          onBlur={() => validatePassword(formData.password)}
          error={errors.password}
          variant={errors.password ? 'error' : 'default'}
          leftIcon={
            <Ionicons name="lock-closed-outline" size={20} color={mutedColor} />
          }
          rightIcon={
            <Pressable
              onPress={() => !isLoading && setShowPassword(!showPassword)}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={mutedColor}
              />
            </Pressable>
          }
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          editable={!isLoading}
          returnKeyType="next"
        />

        {/* Confirm Password Input */}
        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChangeText={(text) => handleInputChange('confirmPassword', text)}
          onBlur={() =>
            validateConfirmPassword(formData.password, formData.confirmPassword)
          }
          error={errors.confirmPassword}
          variant={errors.confirmPassword ? 'error' : 'default'}
          leftIcon={
            <Ionicons name="lock-closed-outline" size={20} color={mutedColor} />
          }
          rightIcon={
            <Pressable
              onPress={() =>
                !isLoading && setShowConfirmPassword(!showConfirmPassword)
              }
              onTouchStart={(e) => e.stopPropagation()}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={mutedColor}
              />
            </Pressable>
          }
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          editable={!isLoading}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onPress={handleSubmit}
          leftIcon={
            !isLoading ? (
              <Ionicons
                name="person-add-outline"
                size={20}
                color={onPrimaryColor}
              />
            ) : undefined
          }
          fullWidth
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </View>

      {/* Login Link */}
      <Card.Footer withDivider align="center" className="mt-6">
        <View className="flex-row items-center gap-1">
          <Text className="text-sm text-text">Already have an account?</Text>
          <Pressable onPress={() => router.push('/')}>
            <Text className="text-sm text-primary font-medium">
              Sign in here
            </Text>
          </Pressable>
        </View>
      </Card.Footer>
    </Card.Root>
  )
}

export default SignUpForm
