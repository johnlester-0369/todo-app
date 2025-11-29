import React, { useState, useCallback } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useUserAuth } from '@/contexts/UserAuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuthForm } from '@/features/auth/hooks'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import Checkbox from '@/components/ui/Checkbox'

/**
 * LoginForm Component
 *
 * Renders the login form with email/password fields, remember me checkbox,
 * and forgot password link. Handles validation and submission.
 *
 * CRITICAL: This component does NOT handle auth redirects!
 * Auth navigation is centralized in app/_layout.tsx via useProtectedRoute().
 * When login succeeds, the auth state changes and the root layout's
 * useProtectedRoute() hook will automatically redirect to (tabs).
 *
 * @example
 * ```tsx
 * <LoginForm />
 * ```
 */
export function LoginForm() {
  const router = useRouter()
  const { login } = useUserAuth()
  const { getColor } = useTheme()
  const { errors, validateEmail, validatePassword, clearFieldError } =
    useAuthForm()

  // Theme colors for native components
  const onPrimaryColor = getColor('on-primary')
  const mutedColor = getColor('muted')

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  /**
   * Validate all form fields
   */
  const validateForm = useCallback((): boolean => {
    const isEmailValid = validateEmail(email).isValid
    const isPasswordValid = validatePassword(password).isValid
    return isEmailValid && isPasswordValid
  }, [email, password, validateEmail, validatePassword])

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    setLoginError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await login(email, password, rememberMe)
      console.log('✅ Login successful - auth guard will handle redirect')
      // NO REDIRECT HERE!
      // The root layout's useProtectedRoute() will detect the auth state change
      // and redirect to (tabs) automatically. This prevents redirect loops.
    } catch (err) {
      console.error('Login failed:', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Invalid credentials. Please try again.'
      setLoginError(errorMessage)
      setLoading(false)
    }
    // Note: Don't set loading to false on success - let the redirect happen
    // The component will unmount when navigation occurs
  }, [validateForm, login, email, password, rememberMe])

  /**
   * Handle email input change
   */
  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text)
      if (errors.email) {
        clearFieldError('email')
      }
      if (loginError) {
        setLoginError('')
      }
    },
    [errors.email, loginError, clearFieldError],
  )

  /**
   * Handle password input change
   */
  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text)
      if (errors.password) {
        clearFieldError('password')
      }
      if (loginError) {
        setLoginError('')
      }
    },
    [errors.password, loginError, clearFieldError],
  )

  return (
    <Card.Root variant="unstyled">
      <View className="gap-6">
        {/* Error Alert */}
        {loginError && (
          <Alert
            variant="error"
            title="Login Failed"
            message={loginError}
            onClose={() => setLoginError('')}
          />
        )}

        {/* Email Input */}
        <Input
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          onChangeText={handleEmailChange}
          onBlur={() => validateEmail(email)}
          error={errors.email}
          variant={errors.email ? 'error' : 'default'}
          leftIcon={
            <Ionicons name="mail-outline" size={20} color={mutedColor} />
          }
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          returnKeyType="next"
        />

        {/* Password Input */}
        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={handlePasswordChange}
          onBlur={() => validatePassword(password)}
          error={errors.password}
          variant={errors.password ? 'error' : 'default'}
          leftIcon={
            <Ionicons name="lock-closed-outline" size={20} color={mutedColor} />
          }
          rightIcon={
            <Pressable
              onPress={() => !loading && setShowPassword(!showPassword)}
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
          editable={!loading}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {/* Remember Me & Forgot Password */}
        <View className="flex-row items-center justify-between">
          <Checkbox
            checked={rememberMe}
            onChange={setRememberMe}
            disabled={loading}
            label="Remember me"
            size="sm"
          />

          <Pressable onPress={() => console.log('Forgot password')}>
            <Text className="text-sm text-primary font-medium">
              Forgot password?
            </Text>
          </Pressable>
        </View>

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          isLoading={loading}
          onPress={handleSubmit}
          leftIcon={
            !loading ? (
              <Ionicons
                name="log-in-outline"
                size={20}
                color={onPrimaryColor}
              />
            ) : undefined
          }
          fullWidth
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </View>

      {/* Sign Up Link */}
      <Card.Footer withDivider align="center" className="mt-6">
        <View className="flex-row items-center gap-1">
          <Text className="text-sm text-text">{"Don't have an account?"}</Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text className="text-sm text-primary font-medium">
              Create one now
            </Text>
          </Pressable>
        </View>
      </Card.Footer>
    </Card.Root>
  )
}

export default LoginForm
