import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import IconButton from '@/components/ui/IconButton'

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <IconButton
      onClick={toggleTheme}
      icon={
        theme === 'light' ? (
          <Moon className="transition-colors duration-300" />
        ) : (
          <Sun className="transition-colors duration-300" />
        )
      }
      variant="ghost"
      aria-label="Toggle theme"
      className="border border-border"
    />
  )
}

export default ThemeToggle
