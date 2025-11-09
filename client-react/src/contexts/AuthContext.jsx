import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const navigate = useNavigate()

  const checkAuth = React.useCallback(async (showErrors = false) => {
    try {
      setLoading(true)
      const response = await Auth.dashboard()
      if (response.data.success) {
        setUser(response.data.user)
      } else {
        setUser(null)
      }
      setHasCheckedAuth(true)
    } catch (error) {
      setUser(null)
      setHasCheckedAuth(true)
      // Only show error if explicitly requested (not for initial silent check)
      if (showErrors && error.response?.status !== 401) {
        console.error('Auth check failed:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Check if user is authenticated on mount (only once, if not already checked)
  // Only check if we're on a protected route or need to verify auth
  useEffect(() => {
    // Don't check auth on landing page or public routes
    const pathname = window.location.pathname;
    const isPublicRoute = ['/', '/login', '/register'].includes(pathname);
    
    if (isPublicRoute) {
      // For public routes, skip auth check entirely to avoid unnecessary API calls
      setHasCheckedAuth(true);
      setLoading(false);
    } else if (!hasCheckedAuth && !user) {
      // Only check auth for protected routes
      checkAuth(false); // Silent check on mount for protected routes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setUser(null)
      navigate('/login')
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => {
      window.removeEventListener('auth:logout', handleLogout)
    }
  }, [navigate])

  const login = (userData) => {
    setUser(userData)
    setLoading(false) // Mark as not loading since we have user data
    setHasCheckedAuth(true) // Mark as checked since we have user from login
  }

  const logout = async () => {
    try {
      await Auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setHasCheckedAuth(false) // Reset so auth can be checked again on next login
      navigate('/login')
      window.dispatchEvent(new CustomEvent('toast', {
        detail: {
          title: 'Logged out',
          description: 'You have been successfully logged out.',
          variant: 'success'
        }
      }))
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

