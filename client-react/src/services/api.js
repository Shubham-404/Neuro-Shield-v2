import axios from 'axios'

// Basic axios instance; update baseURL when backend is ready
const backendURL = import.meta.env.VITE_ENV === 'development' ? 'http://localhost:5000' : import.meta.env.VITE_BACKEND_URL;
export const api = axios.create({
  baseURL: backendURL + '/api',
  timeout: 15000,
  withCredentials: true, // Important for httpOnly cookies
})

// Add response interceptor to handle 401 errors
let isRedirecting = false

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Prevent multiple redirects
      if (isRedirecting) {
        return Promise.reject(error)
      }
      
      // Don't redirect if we're already on login/register
      if (window.location.pathname === '/login' || window.location.pathname === '/register') {
        return Promise.reject(error)
      }

      isRedirecting = true
      
      // Clear any auth state
      window.dispatchEvent(new CustomEvent('auth:logout'))
      
      // Small delay before redirect to prevent race conditions
      setTimeout(() => {
        window.location.href = '/login'
        isRedirecting = false
      }, 100)
    }
    return Promise.reject(error)
  }
)

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
