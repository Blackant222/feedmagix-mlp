import { apiClient } from './api';
import { User } from '../types';

interface LoginRequest {
  phone?: string;
  email?: string;
  pin: string;
}

interface SignupRequest {
  name: string;
  phone?: string;
  email?: string;
  country: string;
  city: string;
  pin: string;
  locale: 'fa' | 'en';
}

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    
    return response;
  },

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.request('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      apiClient.clearAuthToken();
    }
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.request<User>('/api/auth/me');
  },

  setToken(token: string) {
    apiClient.setAuthToken(token);
  },

  clearToken() {
    apiClient.clearAuthToken();
  }
};