import axios from "axios";

// Normalize API base URL: trim whitespace, strip trailing slashes, and ensure /api endpoint path
const rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:5500/api").trim().replace(/\/+$/, "");
export const API_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

export const api = axios.create({
  baseURL: API_URL,
});

// Automatically attach JWT token from localStorage to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration or auth issues gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized request (401). Token may be expired or missing.");
    }
    return Promise.reject(error);
  }
);


