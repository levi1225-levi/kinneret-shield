import { supabase } from '../lib/supabase';
import { User, UserRole, PaginatedResponse, PaginationParams } from '../types';

const PAGE_SIZE = 50;

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
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return {
    items: data || [],
    total: count || 0,
    page,
    limit,
    pages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Search users by query string (name or email)
 */
export const searchUsers = async (
  query: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<User>> => {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let dbQuery = supabase
    .from('users')
    .select('*', { count: 'exact' });

  // Search by name or email using ilike for case-insensitive search
  dbQuery = dbQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`);

  dbQuery = dbQuery.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await dbQuery;

  if (error) {
    throw new Error(`Failed to search users: ${error.message}`);
  }

  return {
    items: data || [],
    total: count || 0,
    page,
    limit,
    pages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Get a specific user by ID
 */
export const getUser = async (id: string): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
};

/**
 * Update a user
 */
export const updateUser = async (
  id: string,
  data: UpdateUserData
): Promise<User> => {
  const { data: result, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return result;
};

/**
 * Deactivate a user account
 */
export const deactivateUser = async (id: string): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to deactivate user: ${error.message}`);
  }

  return data;
};

/**
 * Activate a user account
 */
export const activateUser = async (id: string): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .update({ is_active: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to activate user: ${error.message}`);
  }

  return data;
};
