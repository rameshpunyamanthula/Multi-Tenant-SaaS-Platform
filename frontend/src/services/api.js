import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  registerTenant: (data) => api.post("/auth/register-tenant", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// Tenants APIs
export const tenantsAPI = {
  list: (params) => api.get("/tenants", { params }),
};

// Users APIs
export const usersAPI = {
  list: (params) => api.get("/users", { params }),
  create: (data) => api.post("/users", data),
  update: (userId, data) => api.patch(`/users/${userId}`, data),
  deactivate: (userId) => api.delete(`/users/${userId}`),
};

// Projects APIs
export const projectsAPI = {
  list: (params) => api.get("/projects", { params }),
  getById: (projectId) => api.get(`/projects/${projectId}`),
  create: (data) => api.post("/projects", data),
  update: (projectId, data) => api.patch(`/projects/${projectId}`, data),
  archive: (projectId) => api.delete(`/projects/${projectId}`),
};

// Tasks APIs
export const tasksAPI = {
  list: (params) => api.get("/tasks", { params }),
  create: (data) => api.post("/tasks", data),
  update: (taskId, data) => api.patch(`/tasks/${taskId}`, data),
  delete: (taskId) => api.delete(`/tasks/${taskId}`),
};

export default api;
