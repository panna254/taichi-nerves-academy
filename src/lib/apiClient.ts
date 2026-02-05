/**
 * API Client
 * 
 * Centralized HTTP client for making API requests.
 * Handles authentication tokens, error handling, and request/response interceptors.
 */

import { API_BASE_URL, API_TIMEOUT } from "@/config/api";

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    try {
      const session = localStorage.getItem("user_auth_session");
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.token || null;
      }
    } catch (error) {
      console.error("Failed to get auth token:", error);
    }
    return null;
  }

  /**
   * Get admin authentication token from localStorage
   */
  private getAdminAuthToken(): string | null {
    try {
      const session = localStorage.getItem("admin_auth_session");
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.token || null;
      }
    } catch (error) {
      console.error("Failed to get admin auth token:", error);
    }
    return null;
  }

  /**
   * Build full URL from endpoint
   */
  private buildURL(endpoint: string): string {
    // If endpoint already includes http/https, use it as-is
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      return endpoint;
    }
    
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    return `${this.baseURL}/${cleanEndpoint}`;
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response): Promise<never> {
    let errorMessage = "An error occurred";
    let errors: Record<string, string[]> | undefined;

    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        errorMessage = data.message || data.error || errorMessage;
        errors = data.errors;
      } else {
        errorMessage = await response.text() || errorMessage;
      }
    } catch (parseError) {
      // If we can't parse the error, use status text
      errorMessage = response.statusText || errorMessage;
    }

    const error: ApiError = {
      message: errorMessage,
      status: response.status,
      errors,
    };

    // Handle specific status codes
    if (response.status === 401) {
      // Unauthorized - clear session
      localStorage.removeItem("user_auth_session");
      localStorage.removeItem("admin_auth_session");
      // Could trigger logout here if needed
    }

    throw error;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAdminToken = false
  ): Promise<T> {
    const url = this.buildURL(endpoint);
    const token = useAdminToken ? this.getAdminAuthToken() : this.getAuthToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleError(response);
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout. Please try again.");
        }
        throw error;
      }

      throw new Error("Network error. Please check your connection.");
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, useAdminToken = false): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, useAdminToken);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, useAdminToken = false): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      useAdminToken
    );
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, useAdminToken = false): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      useAdminToken
    );
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, useAdminToken = false): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
      },
      useAdminToken
    );
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, useAdminToken = false): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, useAdminToken);
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
