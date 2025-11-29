import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useUserAuth } from '@/contexts/UserAuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import Card from '@/components/ui/Card'
import Toggle from '@/components/ui/Toggle'
import Dialog from '@/components/ui/Dialog'
import Alert from '@/components/ui/Alert'
import {
  getInitials,
  getDisplayName,
  getDisplayEmail,
  shouldShowAvatar,
} from '@/utils/avatar.util'

/**
 * Me Screen (Profile Tab)
 *
 * Features:
 * - User profile display
 * - Task statistics
 * - Dark mode toggle
 * - Logout functionality with custom Dialog
 *
 * CRITICAL: This component does NOT handle post-logout navigation!
 *
 * Auth navigation is centralized in app/_layout.tsx via useProtectedRoute().
 * When logout completes, the auth state changes and the root layout's
 * useProtectedRoute() hook will automatically redirect to login.
 */
export default function MeScreen() {
  const insets = useSafeAreaInsets()
  const { user, logout, isLoggingOut } = useUserAuth()
  const { isDark, toggleColorScheme, getColor } = useTheme()
  const { stats } = useTasks({ status: 'all' })

  const [imageError, setImageError] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  // User display info
  const displayName = getDisplayName(user?.name)
  const displayEmail = getDisplayEmail(user?.email)
  const initials = getInitials(user?.name)
  const showImage = shouldShowAvatar(user?.image, imageError)
  const avatarSrc = user?.image ? { uri: user.image } : undefined

  /**
   * Handle logout button press - opens confirmation dialog
   */
  const handleLogoutPress = () => {
    setShowLogoutDialog(true)
  }

  /**
   * Handle confirmed logout
   *
   * CRITICAL: No navigation logic here!
   * The root layout's useProtectedRoute() will detect that isAuthenticated
   * becomes false and will automatically redirect to the login screen.
   * This prevents redirect loops.
   */
  const handleConfirmLogout = async () => {
    setShowLogoutDialog(false)
    try {
      await logout()
      console.log('✅ Logout successful - auth guard will handle redirect')
      // NO REDIRECT HERE!
      // The root layout's useProtectedRoute() will detect the auth state change
      // and redirect to login automatically. This prevents redirect loops.
    } catch (error) {
      console.error('Logout failed:', error)
      setLogoutError('Failed to log out. Please try again.')
      setTimeout(() => setLogoutError(''), 5000)
    }
  }

  // Calculate completion percentage
  const completionPercentage =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <View className="flex-1 bg-bg">
      {/* Header */}
      <View
        className="bg-surface-1 border-b border-divider"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-headline">Profile</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        {/* Error Alert */}
        {logoutError && (
          <View className="px-4 pt-4">
            <Alert
              variant="error"
              title={logoutError}
              onClose={() => setLogoutError('')}
            />
          </View>
        )}

        {/* Profile Card */}
        <View className="px-4 pt-6">
          <Card.Root padding="lg" variant="elevated">
            <View className="items-center">
              {/* Avatar */}
              <View className="mb-4">
                {showImage && avatarSrc ? (
                  <Image
                    source={avatarSrc}
                    onError={() => setImageError(true)}
                    className="w-24 h-24 rounded-full border-4 border-primary/20"
                  />
                ) : (
                  <View className="w-24 h-24 rounded-full bg-primary items-center justify-center border-4 border-primary/20">
                    <Text className="text-on-primary text-3xl font-bold">
                      {initials}
                    </Text>
                  </View>
                )}
              </View>

              {/* User Info */}
              <Text className="text-xl font-bold text-headline">
                {displayName}
              </Text>
              <Text className="text-muted mt-1">{displayEmail}</Text>
            </View>
          </Card.Root>
        </View>

        {/* Stats Card */}
        <View className="px-4 pt-4">
          <Card.Root padding="md" variant="elevated">
            <Text className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">
              Your Progress
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-headline">
                  {stats.total}
                </Text>
                <Text className="text-xs text-muted mt-1">Total</Text>
              </View>
              <View className="w-px h-10 bg-divider" />
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-primary">
                  {stats.active}
                </Text>
                <Text className="text-xs text-muted mt-1">Active</Text>
              </View>
              <View className="w-px h-10 bg-divider" />
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-success">
                  {stats.completed}
                </Text>
                <Text className="text-xs text-muted mt-1">Done</Text>
              </View>
              <View className="w-px h-10 bg-divider" />
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-headline">
                  {completionPercentage}%
                </Text>
                <Text className="text-xs text-muted mt-1">Complete</Text>
              </View>
            </View>
          </Card.Root>
        </View>

        {/* Settings Section */}
        <View className="px-4 pt-6">
          <Text className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide px-1">
            Settings
          </Text>
          <Card.Root padding="none" variant="elevated">
            {/* Dark Mode Toggle */}
            <TouchableOpacity
              onPress={toggleColorScheme}
              className="flex-row items-center justify-between px-4 py-4 active:bg-surface-hover-1"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full bg-surface-2 items-center justify-center">
                  <Ionicons
                    name={isDark ? 'moon' : 'sunny'}
                    size={20}
                    color={getColor('primary')}
                  />
                </View>
                <View>
                  <Text className="text-base font-medium text-headline">
                    Dark Mode
                  </Text>
                  <Text className="text-sm text-muted">
                    {isDark ? 'On' : 'Off'}
                  </Text>
                </View>
              </View>
              <Toggle checked={isDark} onChange={toggleColorScheme} size="md" />
            </TouchableOpacity>

            <View className="h-px bg-divider mx-4" />
          </Card.Root>
        </View>

        {/* Logout Section */}
        <View className="px-4 pt-6">
          <Card.Root padding="none" variant="elevated">
            <TouchableOpacity
              onPress={handleLogoutPress}
              disabled={isLoggingOut}
              className="flex-row items-center justify-center gap-2 px-4 py-4 active:bg-error/10"
              activeOpacity={0.7}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={getColor('error')}
              />
              <Text className="text-base font-semibold text-error">
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </Text>
            </TouchableOpacity>
          </Card.Root>
        </View>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Dialog.Root
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        closeOnOverlayPress={true}
      >
        <Dialog.Portal animationType="fade">
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content size="sm">
              <Dialog.Header>
                <View className="flex-1">
                  <Dialog.Title>Log Out</Dialog.Title>
                </View>
                <Dialog.CloseTrigger size="sm" />
              </Dialog.Header>

              <Dialog.Body scrollable={false}>
                <Text className="text-text text-base leading-6">
                  Are you sure you want to log out?
                </Text>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <TouchableOpacity
                    className="px-4 py-2.5 rounded-lg active:bg-surface-hover-1"
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                  >
                    <Text className="text-muted font-medium text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </Dialog.CloseTrigger>
                <TouchableOpacity
                  onPress={handleConfirmLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2.5 rounded-lg bg-error active:bg-error/80"
                  accessibilityRole="button"
                  accessibilityLabel="Log out"
                >
                  <Text className="text-white font-medium text-base">
                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                  </Text>
                </TouchableOpacity>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Portal>
      </Dialog.Root>
    </View>
  )
}
