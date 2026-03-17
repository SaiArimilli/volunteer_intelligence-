/**
 * api.js - Centralized API service
 * All calls to the FastAPI backend go through here.
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Volunteers ────────────────────────────────────────────────────────────────
export const volunteerAPI = {
  register:    (data)       => api.post('/api/volunteers/register', data),
  getById:     (id)         => api.get(`/api/volunteers/${id}`),
  getAll:      ()           => api.get('/api/volunteers/'),
  logActivity: (id, hours)  => api.post(`/api/volunteers/${id}/log-activity?hours=${hours}&task_done=true`),
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const taskAPI = {
  getAll:           ()  => api.get('/api/tasks/'),
  getById:          (id)       => api.get(`/api/tasks/${id}`),
  getRecommended:   (volId)    => api.get(`/api/tasks/recommendations/${volId}`),
  create:           (data)     => api.post('/api/tasks/', data),
}

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiAPI = {
  extractSkills:    (text)     => api.post('/api/ai/extract-skills', { text }),
  predictDropout:   (data)     => api.post('/api/ai/predict-dropout', data),
  chat:             (message, history) => api.post('/api/ai/chat', { message, history }),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => api.get('/api/admin/analytics'),
  getAtRisk:    () => api.get('/api/admin/volunteers/at-risk'),
}

export default api
