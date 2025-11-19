
import React, { useEffect, useState } from 'react'
import { Menu, X, LogIn, UserPlus } from 'lucide-react'
import ThemeToggle from '@/components/common/ThemeToggle'
import { BrandLogo, BrandName } from '@/components/common/Brand'
import IconButton from '@/components/ui/IconButton'
import Button from '@/components/ui/Button'

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/'
  },
  {
    label: 'About',
    href: '/about',
  },
]

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/',
  )

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/'
    return (
      currentPath === href ||
      currentPath.startsWith(href + '/') ||
      currentPath.startsWith(href + '?') ||
      currentPath.startsWith(href + '#')
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <div key={item.label} className="relative">
                    <a
                      href={item.href}
                      onClick={() => setCurrentPath(item.href)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 ${
                        active
                          ? 'text-primary font-semibold'
                          : 'text-text hover:text-text-primary'
                      }`}
                    >
                      {item.label}
                    </a>
                  </div>
                )
              })}
            </nav>
          </div>

          {/* Right side: Auth Buttons + Theme Toggle + Mobile Menu */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Desktop Auth Buttons with visual separator */}
            <div className="hidden md:flex items-center gap-3">
              {/* Visual separator for better spacing */}
              <div className="h-8 w-px bg-border" />
              
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-divider py-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <div key={item.label}>
                    <a
                      href={item.href}
                      onClick={() => {
                        setCurrentPath(item.href)
                        setIsMobileMenuOpen(false)
                      }}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg ${
                        active
                          ? 'text-primary font-semibold'
                          : 'text-text hover:text-text-primary'
                      }`}
                    >
                      {item.label}
                    </a>
                  </div>
                )
              })}

              {/* Mobile Auth Buttons */}
              <div className="pt-4 mt-4 border-t border-divider space-y-2">
                <Button
                  variant="ghost"
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
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header