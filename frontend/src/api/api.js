// import axios from "axios";

// /**
//  * Base API URL
//  * - Local dev: http://localhost:5000/api
//  * - Docker: injected via VITE_API_URL
//  */
// const API_BASE_URL =
//   import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// /**
//  * Axios instance
//  */
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// /**
//  * Attach JWT token automatically
//  */
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// /**
//  * AUTH APIs
//  */
// export const loginUser = async ({ email, password, tenantSubdomain }) => {
//   const response = await api.post("/auth/login", {
//     email,
//     password,
//     tenantSubdomain,
//   });
//   return response.data;
// };

// export const registerTenant = async (payload) => {
//   const response = await api.post("/auth/register-tenant", payload);
//   return response.data;
// };

// export const getCurrentUser = async () => {
//   const response = await api.get("/auth/me");
//   return response.data;
// };

// export const logoutUser = async () => {
//   localStorage.removeItem("token");
// };

// /**
//  * TENANTS
//  */
// export const fetchTenants = async () => {
//   const response = await api.get("/tenants");
//   return response.data;
// };

// /**
//  * USERS
//  */
// export const fetchUsers = async () => {
//   const response = await api.get("/users");
//   return response.data;
// };

// /**
//  * PROJECTS
//  */
// export const fetchProjects = async () => {
//   const response = await api.get("/projects");
//   return response.data;
// };

// export const createProject = async (payload) => {
//   const response = await api.post("/projects", payload);
//   return response.data;
// };

// /**
//  * TASKS
//  */
// export const fetchTasks = async () => {
//   const response = await api.get("/tasks");
//   return response.data;
// };

// export const createTask = async (payload) => {
//   const response = await api.post("/tasks", payload);
//   return response.data;
// };

// export default api;


//----working...
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// 🔐 Attach token automatically
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
