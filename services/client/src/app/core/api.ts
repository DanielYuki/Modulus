import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s for AI generation
});

// Request interceptor (for future auth)
api.interceptors.request.use((config) => {
  // Add auth token here if needed
  return config;
});

// Response interceptor (error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
