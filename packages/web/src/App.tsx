import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { UserAuthProvider } from '@/contexts/UserAuthContext'

/**
 * App component serves as the RouterProvider wrapper.
 * It connects the router configuration to the React app,
 * enabling all route definitions from routes/router.tsx.
 *
 * Wraps the entire app with UserAuthProvider to provide
 * authentication state and methods globally.
 */
export default function App() {
  return (
    <UserAuthProvider>
      <RouterProvider router={router} />
    </UserAuthProvider>
  )
}