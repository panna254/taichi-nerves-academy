import { AuthSession, LoginData, SignupData, User } from "@/types/user";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS, USE_MOCK_API } from "@/config/api";

// ============================================================================
// MOCK API (for development/testing when backend is not available)
// ============================================================================

const simulateDelay = <T>(data: T, delay = 400) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), delay));

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

// Mock users database (in real app, this would be a backend API)
let mockUsers: User[] = [
  {
    id: "u-1",
    name: "John Doe",
    email: "john@example.com",
    membershipStatus: "active",
    membershipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "u-2",
    name: "Jane Smith",
    email: "jane@example.com",
    membershipStatus: "active",
    membershipExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

// Mock password storage (in real app, passwords would be hashed on backend)
const mockPasswords: Record<string, string> = {
  "john@example.com": "password123",
  "jane@example.com": "password123",
};

// ============================================================================
// MOCK API IMPLEMENTATION
// ============================================================================

const mockUserApi = {
  async login(credentials: LoginData): Promise<AuthSession> {
    await simulateDelay(null, 500);

    const user = mockUsers.find((u) => u.email === credentials.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const storedPassword = mockPasswords[credentials.email];
    if (!storedPassword || storedPassword !== credentials.password) {
      throw new Error("Invalid email or password");
    }

    const token = `user-token-${user.id}-${Date.now()}`;
    return { token, user };
  },

  async signup(data: SignupData): Promise<AuthSession> {
    await simulateDelay(null, 600);

    const existingUser = mockUsers.find((u) => u.email === data.email);
    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const newUser: User = {
      id: uid(),
      name: data.name,
      email: data.email,
      membershipStatus: "active",
      membershipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    mockPasswords[data.email] = data.password;

    const token = `user-token-${newUser.id}-${Date.now()}`;
    return { token, user: newUser };
  },

  async getCurrentUser(token: string): Promise<User> {
    await simulateDelay(null, 300);
    const userId = token.split("-")[2];
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error("Invalid token");
    }
    return user;
  },
};

// ============================================================================
// REAL API IMPLEMENTATION (connects to backend)
// ============================================================================

const realUserApi = {
  /**
   * Login user with email and password
   * 
   * Backend should:
   * - Validate email/password
   * - Hash password comparison (never send plain passwords)
   * - Return JWT token and user data
   * - Set secure HTTP-only cookies if using cookie-based auth
   */
  async login(credentials: LoginData): Promise<AuthSession> {
    const response = await apiClient.post<{
      token: string;
      user: User;
      expiresIn?: number; // Token expiration in seconds
    }>(API_ENDPOINTS.AUTH.LOGIN, credentials);

    return {
      token: response.token,
      user: response.user,
    };
  },

  /**
   * Register new user
   * 
   * Backend should:
   * - Validate email format and uniqueness
   * - Validate password strength (min 8 chars, complexity rules)
   * - Hash password before storing (bcrypt, argon2, etc.)
   * - Create user record in database
   * - Send verification email (optional)
   * - Return JWT token and user data
   */
  async signup(data: SignupData): Promise<AuthSession> {
    const response = await apiClient.post<{
      token: string;
      user: User;
      expiresIn?: number;
    }>(API_ENDPOINTS.AUTH.SIGNUP, data);

    return {
      token: response.token,
      user: response.user,
    };
  },

  /**
   * Get current authenticated user
   * 
   * Backend should:
   * - Validate JWT token from Authorization header
   * - Return user data from database
   * - Handle token expiration gracefully
   */
  async getCurrentUser(token: string): Promise<User> {
    const response = await apiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
    return response.user;
  },
};

// ============================================================================
// EXPORTED API (switches between mock and real based on config)
// ============================================================================

/**
 * User API Service
 * 
 * Automatically switches between mock and real API based on environment configuration.
 * Set VITE_USE_MOCK_API=true or omit VITE_API_BASE_URL to use mock API.
 * 
 * To use real backend:
 * 1. Set VITE_API_BASE_URL in .env file (e.g., http://localhost:3000/api)
 * 2. Ensure backend implements the required endpoints (see API_DOCUMENTATION.md)
 */
export const userApi = USE_MOCK_API ? mockUserApi : realUserApi;

// ============================================================================
// REAL API IMPLEMENTATION (connects to backend)
// ============================================================================

const realUserApi = {
  /**
   * Login user with email and password
   * 
   * Backend should:
   * - Validate email/password
   * - Hash password comparison (never send plain passwords)
   * - Return JWT token and user data
   * - Set secure HTTP-only cookies if using cookie-based auth
   */
  async login(credentials: LoginData): Promise<AuthSession> {
    const response = await apiClient.post<{
      token: string;
      user: User;
      expiresIn?: number; // Token expiration in seconds
    }>(API_ENDPOINTS.AUTH.LOGIN, credentials);

    return {
      token: response.token,
      user: response.user,
    };
  },

  /**
   * Register new user
   * 
   * Backend should:
   * - Validate email format and uniqueness
   * - Validate password strength (min 8 chars, complexity rules)
   * - Hash password before storing (bcrypt, argon2, etc.)
   * - Create user record in database
   * - Send verification email (optional)
   * - Return JWT token and user data
   */
  async signup(data: SignupData): Promise<AuthSession> {
    const response = await apiClient.post<{
      token: string;
      user: User;
      expiresIn?: number;
    }>(API_ENDPOINTS.AUTH.SIGNUP, data);

    return {
      token: response.token,
      user: response.user,
    };
  },

  /**
   * Get current authenticated user
   * 
   * Backend should:
   * - Validate JWT token from Authorization header
   * - Return user data from database
   * - Handle token expiration gracefully
   */
  async getCurrentUser(token: string): Promise<User> {
    const response = await apiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
    return response.user;
  },
};

// ============================================================================
// EXPORTED API (switches between mock and real based on config)
// ============================================================================

/**
 * User API Service
 * 
 * Automatically switches between mock and real API based on environment configuration.
 * Set VITE_USE_MOCK_API=true or omit VITE_API_BASE_URL to use mock API.
 * 
 * To use real backend:
 * 1. Set VITE_API_BASE_URL in .env file (e.g., http://localhost:3000/api)
 * 2. Ensure backend implements the required endpoints (see API_DOCUMENTATION.md)
 */
export const userApi = USE_MOCK_API ? mockUserApi : realUserApi;
