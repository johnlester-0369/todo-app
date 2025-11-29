import React from 'react'
import { BrandLogo, BrandName } from '@/components/common/Brand'
import AvatarMenu from '@/components/common/AvatarMenu'
import { useUserAuth } from '@/contexts/UserAuthContext'

const Header: React.FC = () => {
  const { user, logout, isLoading } = useUserAuth()

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      // Redirect to home page after logout
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Show loading state while fetching user data
  if (isLoading || !user) {
    return (
      <header className="sticky top-0 bg-surface-1 z-50 w-full shadow-soft">
        <div className="w-full px-4 md:px-8 lg:px-12 xl:px-32">
          <div className="flex h-16 items-center justify-between">
            {/* Left side: Logo */}
            <div className="flex items-center gap-2">
              <BrandLogo />
              <BrandName />
            </div>

            {/* Right side: Loading skeleton */}
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-surface-2 animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 bg-surface-1 z-50 w-full shadow-soft">
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-32">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Logo + Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <BrandLogo />
              <BrandName />
            </div>
          </div>

          {/* Right side: Avatar Menu */}
          <div className="flex items-center">
            <AvatarMenu
              user={{
                name: user.name,
                email: user.email,
                image: user.image,
              }}
              onLogout={handleLogout}
              profilePath="/profile"
              size="md"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
