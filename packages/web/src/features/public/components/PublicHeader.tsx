import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import ThemeToggle from '@/components/common/ThemeToggle'
import { BrandLogo, BrandName } from '@/components/common/Brand'
import IconButton from '@/components/ui/IconButton'

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  preload?: 'home' | 'notFound' | 'docsIndex' | 'docsUseState'
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    preload: 'home',
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

          {/* Right side: Theme Toggle */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

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
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
