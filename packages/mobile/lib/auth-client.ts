import { createAuthClient } from 'better-auth/react'
import { expoClient } from '@better-auth/expo/client'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

/**
 * Determine backend URL from Expo config or environment
 * For development, use your local IP or ngrok URL
 * For production, use your actual API domain
 *
 * @example
 * In app.json extra config:
 * "extra": {
 *   "BETTER_AUTH_BASE_URL": "https://your-api.com"
 * }
 */
const BACKEND_BASE_URL = Constants.expoConfig?.extra
  ?.BETTER_AUTH_BASE_URL as string

/**
 * Get the app scheme from Expo config
 * This must match the scheme defined in app.json
 */
const APP_SCHEME = Constants.expoConfig?.scheme as string

/**
 * Expo Better Auth client
 *
 * Uses expo-secure-store to persist session tokens securely on native devices.
 * The expoClient plugin handles cookie/session management automatically.
 *
 * IMPORTANT: The server MUST have session.cookieCache.enabled set to true
 * for session persistence to work in Expo.
 */
export const authUserClient = createAuthClient({
  baseURL: BACKEND_BASE_URL + '/api/v1/user/auth',
  fetchOptions: {
    // Do NOT use credentials: 'include' - Expo plugin handles cookies automatically
    onError(context: { error: Error; response?: Response }) {
      console.error('❌ User auth request failed:', context.error)
      if (context.response?.status === 401) {
        console.log('⚠️ User unauthorized - session may have expired')
      }
      if (context.response?.status === 403) {
        console.error(
          '⚠️ Origin/CSRF error - check server trustedOrigins config',
        )
      }
    },
  },
  plugins: [
    expoClient({
      scheme: APP_SCHEME, // Uses scheme from app.json: "TodoApp"
      storagePrefix: APP_SCHEME, // Consistent prefix for SecureStore keys
      storage: SecureStore, // Expo secure storage for tokens
      // Match the server's cookie prefix to identify which cookies belong to this client
      cookiePrefix: 'user',
    }),
  ],
})
