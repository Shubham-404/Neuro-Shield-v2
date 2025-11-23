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

  // Doctor Management
  addDoctor: (email) => api.post('/patient/add-doctor', { doctorEmail: email }),
  removeDoctor: (doctorId) => api.post('/patient/remove-doctor', { doctorId }),
  getMyDoctors: () => api.get('/patient/my-doctors'),

  // AI Recommendations
  generateAIRecommendations: () => api.post('/patient/generate-recommendations'),
  getAIRecommendations: () => api.get('/patient/recommendations'),
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

// Patient Features endpoints
export const PatientFeatures = {
  // Medical Records
  getRecords: (patientId) => {
    const url = patientId ? `/patient-features/records/${patientId}` : '/patient-features/records'
    return api.get(url)
  },
  uploadRecord: (payload) => api.post('/patient-features/records/upload', payload),
  updateRecord: (id, payload) => api.put(`/patient-features/records/${id}`, payload),
  deleteRecord: (id) => api.delete(`/patient-features/records/${id}`),
  verifyRecord: (id, payload) => api.post(`/patient-features/records/${id}/verify`, payload), // Doctor only

  // Health Metrics
  getMetrics: (patientId, params) => {
    const url = patientId ? `/patient-features/metrics/${patientId}` : '/patient-features/metrics'
    return api.get(url, { params })
  },
  addMetric: (payload) => api.post('/patient-features/metrics', payload),
  updateMetric: (id, payload) => api.put(`/patient-features/metrics/${id}`, payload),
  deleteMetric: (id) => api.delete(`/patient-features/metrics/${id}`),

  // Health Logs
  getLogs: (patientId, params) => {
    const url = patientId ? `/patient-features/logs/${patientId}` : '/patient-features/logs'
    return api.get(url, { params })
  },
  addLog: (payload) => api.post('/patient-features/logs', payload),
  updateLog: (id, payload) => api.put(`/patient-features/logs/${id}`, payload),
  deleteLog: (id) => api.delete(`/patient-features/logs/${id}`),

  // Health Recommendations
  getRecommendations: (patientId, params) => {
    const url = patientId ? `/patient-features/recommendations/${patientId}` : '/patient-features/recommendations'
    return api.get(url, { params })
  },
  generateRecommendations: (patientId) => {
    const url = patientId ? `/patient-features/recommendations/generate/${patientId}` : '/patient-features/recommendations/generate'
    return api.post(url)
  },
  addRecommendation: (payload) => api.post('/patient-features/recommendations', payload),
  updateRecommendation: (id, payload) => api.put(`/patient-features/recommendations/${id}`, payload),
  deleteRecommendation: (id) => api.delete(`/patient-features/recommendations/${id}`),

  // AI Recommendations
  generateGeneralAdvice: () => api.post('/patient-features/recommendations/ai/general'),
  generateDoctorRecommendations: (patientId) => api.post(`/patient-features/recommendations/ai/doctor/${patientId}`),

  // Doctor Finder
  findDoctors: (params) => api.get('/patient-features/doctors/find', { params }),
  getAllLocations: () => api.get('/patient-features/doctors/locations'),
}
