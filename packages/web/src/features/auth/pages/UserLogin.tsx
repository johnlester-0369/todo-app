import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { BrandLogo, BrandName } from '@/components/common/Brand'
import { Mail, Lock, LogIn } from 'lucide-react'

interface LoginFormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

const UserLogin: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string>('')

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }

    if (loginError) {
      setLoginError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log('Login attempt with:', {
        email: formData.email,
        password: '***hidden***',
      })

      navigate('/')
    } catch (error) {
      setLoginError(
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
            Welcome Back
          </h1>
          <p className="text-text">Sign in to your account to continue</p>
        </div>

        <Card.Root>
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              {loginError && (
                <Alert
                  variant="error"
                  title="Login Failed"
                  message={loginError}
                  onClose={() => setLoginError('')}
                />
              )}

              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                leftIcon={<Mail className="h-5 w-5" />}
                disabled={isLoading}
                autoComplete="email"
                required
              />

              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                leftIcon={<Lock className="h-5 w-5" />}
                disabled={isLoading}
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface-2"
                  />
                  <span className="text-text">Remember me</span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                leftIcon={
                  !isLoading ? <LogIn className="h-5 w-5" /> : undefined
                }
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-divider text-center">
            <p className="text-sm text-text">
              Don't have an account?{' '}
              <a
                href="/signup"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Create one now
              </a>
            </p>
          </div>
        </Card.Root>
      </div>
    </div>
  )
}

export default UserLogin
