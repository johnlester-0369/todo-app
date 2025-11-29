import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useUserAuth } from '@/contexts/UserAuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
    return <LoadingSpinner />
  }

  // If not authenticated, redirect to home page (/)
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // If authenticated, render the protected route
  return <Outlet />
}

export default UserProtectedRoute
