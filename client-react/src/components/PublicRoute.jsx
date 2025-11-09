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

  // Only redirect if we're certain the user is authenticated AND not on login page
  // Don't redirect based on loading state
  // Also add a small delay to prevent race conditions with login navigation
  if (!loading && isAuthenticated && user && window.location.pathname === '/login') {
    // Let the LoginPage handle the redirect to avoid conflicts
    // This prevents double redirects
    return children
  }

  // For register page, redirect authenticated users
  if (!loading && isAuthenticated && user && window.location.pathname === '/register') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

