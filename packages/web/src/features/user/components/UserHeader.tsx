import React from 'react'
import { BrandLogo, BrandName } from '@/components/common/Brand'
import AvatarMenu from '@/components/common/AvatarMenu'

const Header: React.FC = () => {
  // Hardcoded user data (static for now)
  const currentUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    image: undefined, // Will show initials "JD"
  }

  // Mock logout handler (static for now)
  const handleLogout = async () => {
    console.log('Logout clicked - implement actual logout logic later')
    // TODO: Implement actual logout logic when authentication is added
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
              user={currentUser}
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