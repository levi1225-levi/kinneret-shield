import client from './client';
import { User, UserRole, PaginatedResponse, PaginationParams } from '../types';

export interface UpdateUserData {
  name?: string;
  email?: string;
  avatar_url?: string;
  role?: UserRole;
}

/**
 * Get all users with pagination
 */
export const getUsers = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<User>> => {
  const response = await client.get<PaginatedResponse<User>>('/users', {
    params: pagination,
  });
  return response.data;
};

/**
 * Search users by query string
 */
export const searchUsers = async (
  query: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<User>> => {
  const response = await client.get<PaginatedResponse<User>>('/users/search', {
    params: {
      q: query,
      ...pagination,
    },
  });
  return response.data;
};

/**
 * Get a specific user by ID
 */
export const getUser = async (id: string): Promise<User> => {
  const response = await client.get<User>(`/users/${id}`);
  return response.data;
};

/**
 * Update a user
 */
export const updateUser = async (
  id: string,
  data: UpdateUserData
): Promise<User> => {
  const response = await client.patch<User>(`/users/${id}`, data);
  return response.data;
};

/**
 * Deactivate a user account
 */
export const deactivateUser = async (id: string): Promise<User> => {
  const response = await client.post<User>(`/users/${id}/deactivate`);
  return response.data;
};

/**
 * Activate a user account
 */
export const activateUser = async (id: string): Promise<User> => {
  const response = await client.post<User>(`/users/${id}/activate`);
  return response.data;
};
