import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './UserHeader'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg flex flex-col transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
