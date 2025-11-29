import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from 'react'
import { authUserClient } from '@/lib/auth-client'

// Type definitions
interface User {
  id: string
  name: string
  email: string
  image?: string
  role: string
  createdAt: Date
  updatedAt: Date
}

interface Session {
  session: {
    userId: string
    expiresAt: Date
    token: string
    [key: string]: unknown
  }
  user: User
}

interface UserAuthContextType {
  session: Session | null
  user: User | null
  error: Error | null
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => void
  isAuthenticated: boolean
  isLoading: boolean
  /**
   * True when logout is in progress.
   * Used to prevent API calls during the logout transition.
   */
  isLoggingOut: boolean
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined,
)

export const useUserAuth = () => {
  const context = useContext(UserAuthContext)
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider')
  }
  return context
}

interface UserAuthProviderProps {
  children: ReactNode
}

export const UserAuthProvider: React.FC<UserAuthProviderProps> = ({
  children,
}) => {
  const {
    data: session,
    isPending,
    error,
    refetch,
  } = authUserClient.useSession()

  /**
   * Track logout state to prevent API calls during logout transition.
   * This is set BEFORE the actual signOut call to ensure all hooks
   * stop making API requests immediately.
   */
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false) => {
      // Reset logging out state in case it was stuck
      setIsLoggingOut(false)

      const result = await authUserClient.signIn.email(
        {
          email,
          password,
          rememberMe,
        },
        {
          onSuccess: () => {
            console.log('✅ User login successful')
          },
          onError: (ctx) => {
            console.error('❌ User login failed:', ctx.error)
            throw new Error(ctx.error.message || 'Login failed')
          },
        },
      )

      if (result.error) {
        throw new Error(result.error.message || 'Login failed')
      }

      // Refresh session after login
      await refetch()
    },
    [refetch],
  )

  const logout = useCallback(async () => {
    // CRITICAL: Set logging out flag BEFORE any async operations
    // This immediately stops all hooks from making API calls
    setIsLoggingOut(true)

    try {
      const result = await authUserClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            console.log('✅ User logout successful')
          },
          onError: (ctx) => {
            console.error('❌ User logout failed:', ctx.error)
          },
        },
      })

      if (result.error) {
        console.error('Logout error:', result.error)
        // Reset flag on error so user can try again
        setIsLoggingOut(false)
        throw new Error(result.error.message || 'Logout failed')
      }

      // Refresh session to clear authenticated state
      // This triggers the auth guard to redirect
      await refetch()

      // Note: We don't reset isLoggingOut here because:
      // 1. The component will unmount when navigation occurs
      // 2. On next login, isLoggingOut will be reset
      // 3. If we reset it, there's a window where API calls could happen
    } catch (error) {
      // Reset flag on error so user can retry
      setIsLoggingOut(false)
      console.error('Logout failed:', error)
      throw error
    }
  }, [refetch])

  const value: UserAuthContextType = {
    session: session as Session | null,
    user: (session as Session | null)?.user ?? null,
    error,
    isAuthenticated: !!session,
    isLoading: isPending,
    isLoggingOut,
    login,
    logout,
    refreshSession: refetch,
  }

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  )
}

export type { User, Session, UserAuthContextType }
