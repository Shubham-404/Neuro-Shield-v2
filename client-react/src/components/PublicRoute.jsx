import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageLoader } from './ui/loader'

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()

  // Show loader only if we're actively checking auth (not on public routes)
  // For public routes, we don't need to wait for auth check
  if (loading && user === null) {
    // Only show loader if we're actually checking (not on initial mount of public route)
    const isChecking = window.location.pathname !== '/' && !isAuthenticated
    if (isChecking) {
      return <PageLoader show={true} />
    }
  }

  // Only redirect if we're certain the user is authenticated
  // Don't redirect based on loading state
  if (!loading && isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

