import React from 'react'
import { BrandLogo, BrandName } from '@/components/common/Brand'

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-auto border-t border-divider bg-surface-2">
      <div className="px-4 py-8 lg:px-8 xl:px-32">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Left side */}
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <BrandName />
            <span className="text-muted">
              © 2025
            </span>
          </div>

          {/* Right side */}
          <div className="text-sm text-muted">
            Built with React + Vite + Tailwind
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer