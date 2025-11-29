import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useUserAuth } from '@/contexts/UserAuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

/**
 * PublicRoute guard component
 *
 * Protects routes that should only be accessible to non-authenticated users
 * (e.g., home page, login, signup).
 * If user IS authenticated, redirect to tasks page.
 */
const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useUserAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner />
  }

  // If authenticated, redirect to tasks page
  if (isAuthenticated) {
    return <Navigate to="/tasks" state={{ from: location }} replace />
  }

  // If not authenticated, render the public route
  return <Outlet />
}

export default PublicRoute
