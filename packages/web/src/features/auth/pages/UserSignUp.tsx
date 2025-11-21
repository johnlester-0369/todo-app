import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authUserClient } from '@/lib/auth-client'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { BrandLogo, BrandName } from '@/components/common/Brand'
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react'
import {
  isValidEmail,
  isValidPassword,
  isValidName,
  doValuesMatch,
  isEmpty,
} from '@/utils/validation.util'

interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const UserSignUp: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [signUpError, setSignUpError] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateName = (value: string): boolean => {
    if (isEmpty(value)) {
      setErrors((prev) => ({ ...prev, name: 'Name is required' }))
      return false
    }
    if (!isValidName(value)) {
      setErrors((prev) => ({
        ...prev,
        name: 'Name must be at least 2 characters and contain only letters',
      }))
      return false
    }
    setErrors((prev) => ({ ...prev, name: undefined }))
    return true
  }

  const validateEmail = (value: string): boolean => {
    if (isEmpty(value)) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }))
      return false
    }
    if (!isValidEmail(value)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Please enter a valid email address',
      }))
      return false
    }
    setErrors((prev) => ({ ...prev, email: undefined }))
    return true
  }

  const validatePasswordField = (value: string): boolean => {
    if (isEmpty(value)) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }))
      return false
    }
    if (!isValidPassword(value)) {
      setErrors((prev) => ({
        ...prev,
        password: 'Password must be at least 6 characters',
      }))
      return false
    }
    setErrors((prev) => ({ ...prev, password: undefined }))
    return true
  }

  const validateConfirmPassword = (value: string): boolean => {
    if (isEmpty(value)) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: 'Please confirm your password',
      }))
      return false
    }
    if (!doValuesMatch(formData.password, value)) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: 'Passwords do not match',
      }))
      return false
    }
    setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    return true
  }

  const validateForm = (): boolean => {
    const isNameValid = validateName(formData.name)
    const isEmailValid = validateEmail(formData.email)
    const isPasswordValid = validatePasswordField(formData.password)
    const isConfirmPasswordValid = validateConfirmPassword(
      formData.confirmPassword,
    )

    return (
      isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }

    // Clear general signup error
    if (signUpError) {
      setSignUpError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
        // Redirect to login page after successful signup
        navigate('/login', {
          state: {
            message: 'Account created successfully! Please sign in.',
          },
        })
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
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Section */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <BrandLogo size="lg" />
          <BrandName />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-headline mb-2">
            Create Account
          </h1>
          <p className="text-text">Sign up to get started</p>
        </div>

        <Card.Root>
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              {signUpError && (
                <Alert
                  variant="error"
                  title="Sign Up Failed"
                  message={signUpError}
                  onClose={() => setSignUpError('')}
                />
              )}

              <div className="grid gap-1">
                <Input
                  type="text"
                  name="name"
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={(e) => validateName(e.target.value)}
                  error={errors.name}
                  leftIcon={<User className="h-5 w-5" />}
                  disabled={isLoading}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="grid gap-1">
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={(e) => validateEmail(e.target.value)}
                  error={errors.email}
                  leftIcon={<Mail className="h-5 w-5" />}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="grid gap-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={(e) => validatePasswordField(e.target.value)}
                  error={errors.password}
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    showPassword ? (
                      <EyeOff
                        className="h-5 w-5 cursor-pointer"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => !isLoading && setShowPassword(false)}
                      />
                    ) : (
                      <Eye
                        className="h-5 w-5 cursor-pointer"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => !isLoading && setShowPassword(true)}
                      />
                    )
                  }
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="grid gap-1">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={(e) => validateConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    showConfirmPassword ? (
                      <EyeOff
                        className="h-5 w-5 cursor-pointer"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          !isLoading && setShowConfirmPassword(false)
                        }
                      />
                    ) : (
                      <Eye
                        className="h-5 w-5 cursor-pointer"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          !isLoading && setShowConfirmPassword(true)
                        }
                      />
                    )
                  }
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                leftIcon={
                  !isLoading ? <UserPlus className="h-5 w-5" /> : undefined
                }
                className="w-full"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-divider text-center">
            <p className="text-sm text-text">
              Already have an account?{' '}
              <a
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in here
              </a>
            </p>
          </div>
        </Card.Root>
      </div>
    </div>
  )
}

export default UserSignUp