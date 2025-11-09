import axios from 'axios'

// Basic axios instance; update baseURL when backend is ready
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  withCredentials: true, // Important for httpOnly cookies
})

// Auth endpoints
export const Auth = {
  login: (payload) => api.post('/login', payload),
  register: (payload) => api.post('/signup', payload),
  logout: () => api.get('/logout'),
  dashboard: () => api.get('/dashboard'),
}

// Patient endpoints
export const Patients = {
  list: () => api.get('/patient/list'),
  create: (payload) => api.post('/patient/create', payload),
  detail: (id) => api.get(`/patient/${id}`),
  delete: (id) => api.post(`/patient/delete/${id}`),
  suggestMedication: (payload) => api.post('/patient/suggest-update', payload),
  updateMedication: (payload) => api.post('/patient/update-medication', payload),
}

// Prediction endpoints
export const Predictions = {
  run: (payload) => api.post('/predict', payload), // { patient_id }
  getHistory: (patient_id) => api.get(`/predict/patient/${patient_id}`),
}

// Analytics endpoints
export const Analytics = {
  getDashboard: () => api.get('/analytics/dashboard'),
}

// Doctor endpoints
export const Doctor = {
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (payload) => api.post('/doctor/update', payload),
}
