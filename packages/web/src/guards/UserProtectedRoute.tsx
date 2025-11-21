import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useUserAuth } from '@/contexts/UserAuthContext'

/**
 * UserProtectedRoute guard component
 *
 * Protects routes that require authentication (e.g., /tasks).
 * If user is NOT authenticated, redirect to home page (/).
 */
const UserProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useUserAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to home page (/)
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // If authenticated, render the protected route
  return <Outlet />
}

export default UserProtectedRoute