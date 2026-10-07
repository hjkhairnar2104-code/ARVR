import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('disastersim_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
        localStorage.removeItem('disastersim_token');
        localStorage.removeItem('disastersim_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials).then((res) => res.data),
  register: (userData) => api.post('/auth/register', userData).then((res) => res.data),
  getMe: () => api.get('/auth/me').then((res) => res.data),
};

// Scenario Services
export const scenarioService = {
  getScenarios: () => api.get('/scenarios').then((res) => res.data),
  getScenarioById: (id) => api.get(`/scenarios/${id}`).then((res) => res.data),
  createScenario: (data) => api.post('/admin/scenarios', data).then((res) => res.data),
  updateScenario: (id, data) => api.put(`/admin/scenarios/${id}`, data).then((res) => res.data),
  deleteScenario: (id) => api.delete(`/admin/scenarios/${id}`).then((res) => res.data),
};

// Training Session Services
export const trainingService = {
  startTraining: (scenarioId) =>
    api.post('/training/start', { scenarioId }).then((res) => res.data),
  recordAction: (sessionId, actionData) =>
    api.post(`/training/${sessionId}/action`, actionData).then((res) => res.data),
  completeTraining: (sessionId, payload) =>
    api.post(`/training/${sessionId}/complete`, payload).then((res) => res.data),
  getSession: (sessionId) => api.get(`/training/${sessionId}`).then((res) => res.data),
  getReport: (sessionId) => api.get(`/training/${sessionId}/report`).then((res) => res.data),
  getEmployeeHistory: (employeeId) =>
    api.get(`/employees/${employeeId}/training-history`).then((res) => res.data),
  getEmployeePerformance: (employeeId) =>
    api.get(`/employees/${employeeId}/performance`).then((res) => res.data),
};

// Admin Services
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard').then((res) => res.data),
  getEmployees: () => api.get('/admin/employees').then((res) => res.data),
  getAnalytics: () => api.get('/admin/analytics').then((res) => res.data),
  getTrainingSessions: () => api.get('/admin/training-sessions').then((res) => res.data),
};

export default api;
