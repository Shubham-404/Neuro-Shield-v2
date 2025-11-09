// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/toast';  // Toast system
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
  // Remove toast dispatch from render — it runs on every render!
  // We'll trigger toasts only from login/register

  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes (add auth later) */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientManagementPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/assessment" element={<ClinicalAssessmentPage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/staff" element={<StaffDashboardPage />} />
        <Route path="/admin" element={<AdminAnalyticsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}