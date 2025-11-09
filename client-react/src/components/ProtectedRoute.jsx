import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageLoader } from './ui/loader'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <PageLoader show={true} />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

