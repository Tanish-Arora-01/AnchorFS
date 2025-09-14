import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Dashboard } from './components/dashboard/Dashboard'
import { AuthPage } from './components/auth/AuthPage'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <AuthPage />
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App