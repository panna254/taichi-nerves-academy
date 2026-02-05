/**
 * API Configuration
 * 
 * This file centralizes API endpoint configuration.
 * In production, these values should come from environment variables.
 */

// Get API base URL from environment variable or use default
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// API endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    ME: "/auth/me", // Get current user
  },
  
  // User endpoints
  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
  },
  
  // Admin endpoints
  ADMIN: {
    BASE: "/admin",
    LOGIN: "/admin/auth/login",
    USERS: "/admin/users",
    CONTENTS: "/admin/contents",
  },
} as const;

// Request timeout in milliseconds
export const API_TIMEOUT = 30000; // 30 seconds

// Whether to use mock API (for development)
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true" || !import.meta.env.VITE_API_BASE_URL;
