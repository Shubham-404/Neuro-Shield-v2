import axios from 'axios'

// Basic axios instance; update baseURL when backend is ready
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

// Example endpoints (placeholders)
export const Auth = {
  login: (payload) => api.post('/auth/login', payload), // TODO: Integrate API
  register: (payload) => api.post('/auth/register', payload), // TODO: Integrate API
}

export const Patients = {
  list: (params) => api.get('/patients', { params }), // TODO: Integrate API
  detail: (id) => api.get(`/patients/${id}`), // TODO: Integrate API
}

export const Predictions = {
  run: (id, payload) => api.post(`/patients/${id}/predict`, payload), // TODO: Integrate API
}
