import React, { useState, useRef, useEffect } from 'react'
import { LogOut, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Toggle from '@/components/ui/Toggle'
import {
  getInitials,
  getDisplayName,
  getDisplayEmail,
  shouldShowAvatar,
} from '@/utils/avatar.util'

interface AvatarMenuProps {
  user: {
    name?: string
    email?: string
    image?: string
  }
  onLogout: () => Promise<void> | void
  profilePath: string
  size?: 'sm' | 'md' | 'lg'
}

const AvatarMenu: React.FC<AvatarMenuProps> = ({
  user,
  onLogout,
  size = 'md',
}) => {
  const { isDark, setTheme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Size configurations
  const sizeConfig = {
    sm: { avatar: 'h-8 w-8', text: 'text-xs', initial: 'text-xs' },
    md: { avatar: 'h-9 w-9', text: 'text-sm', initial: 'text-sm' },
    lg: { avatar: 'h-12 w-12', text: 'text-base', initial: 'text-base' },
  }

  const currentSize = sizeConfig[size]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      await onLogout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Handle image load error
  const handleImageError = () => {
    setImageError(true)
  }

  // Handle dark mode toggle
  const handleDarkModeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  // Use utility functions
  const displayName = getDisplayName(user.name)
  const displayEmail = getDisplayEmail(user.email)
  const initials = getInitials(user.name)
  const showImage = shouldShowAvatar(user.image, imageError)
  const avatarSrc = user.image || undefined

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button with Name */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        aria-label="Open user menu"
        className={`inline-flex items-center gap-2 rounded-full md:pr-3 transition-all duration-200 hover:bg-surface-hover-1 active:bg-surface-hover-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98]`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {showImage ? (
            <img
              src={avatarSrc}
              alt={displayName}
              onError={handleImageError}
              className={`${currentSize.avatar} rounded-full border border-border shadow-soft object-cover block`}
            />
          ) : (
            <div
              className={`${currentSize.avatar} rounded-full border border-border bg-primary flex items-center justify-center shadow-soft transition-colors duration-300`}
            >
              <span
                className={`text-on-primary ${currentSize.initial} font-semibold leading-none`}
              >
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Name - Hidden on mobile, visible on md+ screens */}
        <span
          className={`hidden md:block ${currentSize.text} font-medium text-headline transition-colors duration-300 truncate max-w-[120px]`}
        >
          {displayName}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface-2 border border-border rounded-lg shadow-soft-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-divider bg-surface-1">
            <div className="flex items-center gap-3">
              {/* Fixed size avatar container in dropdown - 48x48px */}
              <div className="h-12 w-12 flex-shrink-0">
                {showImage ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    onError={handleImageError}
                    className="h-12 w-12 rounded-full border border-border shadow-soft object-cover block"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full border border-border bg-primary flex items-center justify-center shadow-soft transition-colors duration-300">
                    <span className="text-on-primary text-base font-semibold leading-none">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-headline truncate transition-colors duration-300">
                  {displayName}
                </p>
                <p className="text-xs text-muted truncate transition-colors duration-300">
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Dark Mode Toggle Section */}
            <div className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-4 w-4 text-muted flex-shrink-0" />
                <span className="text-sm text-text">Dark Mode</span>
              </div>
              <Toggle checked={isDark} onChange={handleDarkModeToggle} />
            </div>
          </div>

          {/* Logout Section */}
          <div className="border-t border-divider py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AvatarMenu
