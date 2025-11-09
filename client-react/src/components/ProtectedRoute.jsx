import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageLoader } from './ui/loader'

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth()

  // If we have a user (from login), check role-based access
  if (user && isAuthenticated) {
    // If allowedRoles is specified, check if user's role is allowed
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // User doesn't have permission for this route
      window.dispatchEvent(new CustomEvent('toast', {
        detail: {
          title: 'Access Denied',
          description: 'You do not have permission to access this page.',
          variant: 'destructive'
        }
      }))
      
      // Redirect to appropriate dashboard based on role
      if (user.role === 'patient') {
        return <Navigate to="/dashboard" replace />
      } else if (user.role === 'doctor') {
        return <Navigate to="/staff" replace />
      } else if (user.role === 'admin') {
        return <Navigate to="/admin" replace />
      }
      return <Navigate to="/dashboard" replace />
    }
    
    // User has access, render children
    return children
  }

  // Show loader while checking auth (but only if we don't have a user)
  if (loading && !user) {
    return <PageLoader show={true} />
  }

  // If no user and not loading, redirect to login
  if (!loading && !user) {
    return <Navigate to="/login" replace />
  }

  // Default: show loader
  return <PageLoader show={true} />
}

