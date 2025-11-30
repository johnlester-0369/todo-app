import React, { useState } from 'react'
import { Menu, X, LogIn, UserPlus } from 'lucide-react'
import ThemeToggle from '@/components/common/ThemeToggle'
import { BrandLogo, BrandName } from '@/components/common/Brand'
import IconButton from '@/components/ui/IconButton'
import Button from '@/components/ui/Button'

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-1 shadow-soft">
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-32">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Logo */}
          <a href="/" className="flex items-center gap-2">
            <BrandLogo />
            <BrandName />
          </a>

          {/* Right side: Auth Buttons + Theme Toggle + Mobile Menu */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Desktop Auth Buttons */}
            <div className="hidden items-center gap-3 md:flex">
              <Button
                variant="secondary"
                leftIcon={<LogIn className="h-4 w-4" />}
                onClick={() => {
                  window.location.href = '/login'
                }}
              >
                Login
              </Button>
              <Button
                variant="primary"
                leftIcon={<UserPlus className="h-4 w-4" />}
                onClick={() => {
                  window.location.href = '/signup'
                }}
              >
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <IconButton
              onClick={toggleMobileMenu}
              icon={isMobileMenuOpen ? <X /> : <Menu />}
              variant="ghost"
              aria-label="Toggle menu"
              className="md:hidden"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-divider py-4 md:hidden">
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                leftIcon={<LogIn className="h-4 w-4" />}
                onClick={() => {
                  window.location.href = '/login'
                  setIsMobileMenuOpen(false)
                }}
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                leftIcon={<UserPlus className="h-4 w-4" />}
                onClick={() => {
                  window.location.href = '/signup'
                  setIsMobileMenuOpen(false)
                }}
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header