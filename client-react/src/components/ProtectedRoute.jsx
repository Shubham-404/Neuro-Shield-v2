import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageLoader } from './ui/loader'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()

  // Show loader while checking auth
  if (loading) {
    return <PageLoader show={true} />
  }

  // If we have a user (from login), allow access even if checkAuth hasn't completed
  // This prevents the redirect loop after login
  if (user && isAuthenticated) {
    return children
  }

  // If no user and not loading, redirect to login
  if (!loading && !user) {
    return <Navigate to="/login" replace />
  }

  // Default: show loader
  return <PageLoader show={true} />
}

