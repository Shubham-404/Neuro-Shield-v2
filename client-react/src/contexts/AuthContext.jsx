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
  const navigate = useNavigate()

  const checkAuth = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await Auth.dashboard()
      if (response.data.success) {
        setUser(response.data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
      // Don't show error toast for initial auth check
    } finally {
      setLoading(false)
    }
  }, [])

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

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
  }

  const logout = async () => {
    try {
      await Auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
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

