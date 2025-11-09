// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientManagementPage from './pages/PatientManagementPage';
import PatientDetailPage from './pages/PatientDetailPage';
import ClinicalAssessmentPage from './pages/ClinicalAssessmentPage';
import PredictionPage from './pages/PredictionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          {/* Protected routes with role-based access */}
          {/* Patient-only routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Doctor and Admin routes */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <StaffDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <PatientManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/patients/:id" element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <PatientDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/patients/:id/predict" element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <PredictionPage />
            </ProtectedRoute>
          } />
          <Route path="/assessment" element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <ClinicalAssessmentPage />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          
          {/* All authenticated users */}
          <Route path="/alerts" element={
            <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
              <AlertsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Admin-only routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalyticsPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}