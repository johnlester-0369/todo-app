import React from 'react'
import { Text, View } from 'react-native'
import Logo from '@/assets/svg/logo.svg'
import { useTheme } from '@/contexts/ThemeContext'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
  className?: string
}

const sizeClasses: Record<BrandLogoSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
}

/**
 * BrandLogo Component
 *
 * Displays the app logo with theme-aware primary color.
 * Color automatically updates when theme changes.
 */
const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'lg',
  className = '',
}) => {
  const { getColor } = useTheme()
  const primaryColor = getColor('primary')

  return (
    // wrapper sized via NativeWind; Logo will fill container
    <View className={`${sizeClasses[size]} ${className} overflow-hidden`}>
      {/* width/height as '100%' make the SVG scale to the wrapper */}
      <Logo
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        color={primaryColor}
      />
    </View>
  )
}

/**
 * BrandName Component
 *
 * Displays the app name with theme-aware headline color.
 */
const BrandName: React.FC = () => {
  return (
    <Text className="whitespace-nowrap font-bold text-xl text-headline">
      TaskFlow
    </Text>
  )
}

export { BrandLogo, BrandName }
