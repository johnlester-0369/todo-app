import React from 'react'
import { BrandLogo, BrandName } from '@/components/common/Brand'

const Header: React.FC = () => {
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
        </div>
      </div>
    </header>
  )
}

export default Header
