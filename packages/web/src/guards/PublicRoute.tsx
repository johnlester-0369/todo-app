import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useUserAuth } from '@/contexts/UserAuthContext'

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text">Loading...</p>
        </div>
      </div>
    )
  }

  // If authenticated, redirect to tasks page
  if (isAuthenticated) {
    return <Navigate to="/tasks" state={{ from: location }} replace />
  }

  // If not authenticated, render the public route
  return <Outlet />
}

export default PublicRoute