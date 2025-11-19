import React, { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
// Import Layout directly (NOT lazy) so header/footer render immediately
import Layout from '@/features/public/components/PublicLayout'

// Lazy pages (same as original)
const HomePage = lazy(() => import('@/features/public/pages/Home'))
const NotFound = lazy(() => import('@/features/NotFound/NotFound'))

/**
 * Small helper to wrap lazy components with Suspense fallback.
 * We intentionally use the same fallback used across the codebase.
 */
const withSuspense = (node: React.ReactElement) => (
  <Suspense fallback={<div className="min-h-screen bg-bg" />}>{node}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: withSuspense(<HomePage />),
      },
      {
        path: '*',
        element: withSuspense(<NotFound />),
      },
    ],
  },
  // Catch-all redirect to 404
  {
    path: '*',
    element: withSuspense(<NotFound />),
  },
])
