import client from './client';
import { User, AuthResponse } from '../types';

// Request/Response interfaces
export interface RegisterData {
  email: string;
  name: string;
  role: string;
  inviteCode?: string;
}

/**
 * Authenticate with Google ID token
 */
export const login = async (googleIdToken: string): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/login', {
    googleIdToken,
  });
  return response.data;
};

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/register', data);
  return response.data;
};

/**
 * Get current authenticated user
 */
export const getMe = async (): Promise<User> => {
  const response = await client.get<User>('/auth/me');
  return response.data;
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const response = await client.post<{ accessToken: string }>('/auth/refresh');
  return response.data;
};
