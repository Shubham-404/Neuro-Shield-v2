import axios from 'axios'

// Basic axios instance; update baseURL when backend is ready
const backendURL = import.meta.env.VITE_ENV === 'development' ? 'http://localhost:5000' : import.meta.env.VITE_BACKEND_URL;
export const api = axios.create({
  baseURL: backendURL + '/api',
  timeout: 30000, // Increased timeout for production
  withCredentials: true, // Critical for httpOnly cookies - must be true for cross-origin
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add request interceptor to log requests in development
if (import.meta.env.VITE_ENV === 'development') {
  api.interceptors.request.use(
    (config) => {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );
}

// Add response interceptor to handle 401 errors
let isRedirecting = false
let lastLoginTime = 0
const LOGIN_GRACE_PERIOD = 2000 // 2 seconds after login to allow cookie to be set

// Track when login happens (called from LoginPage after successful login)
export const trackLogin = () => {
  lastLoginTime = Date.now()
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Prevent multiple redirects
      if (isRedirecting) {
        return Promise.reject(error)
      }
      
      const pathname = window.location.pathname;
      // Don't redirect if we're on public routes
      if (pathname === '/' || pathname === '/login' || pathname === '/register') {
        return Promise.reject(error)
      }

      // Don't redirect if we just logged in (grace period for cookie to be set)
      const timeSinceLogin = Date.now() - lastLoginTime
      if (timeSinceLogin < LOGIN_GRACE_PERIOD) {
        console.log('Ignoring 401 error - within login grace period')
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
  update: (id, payload) => api.post(`/patient/update/${id}`, payload),
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
