import { supabase } from '../lib/supabase';
import { InviteCode, UserRole, PaginatedResponse, PaginationParams } from '../types';

const PAGE_SIZE = 50;

/**
 * Get all invite codes with pagination
 */
export const getInvites = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<InviteCode>> => {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('invite_codes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch invite codes: ${error.message}`);
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
 * Get unused invite codes
 */
export const getUnusedInvites = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<InviteCode>> => {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('invite_codes')
    .select('*', { count: 'exact' })
    .eq('is_used', false)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch unused invite codes: ${error.message}`);
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
 * Create a new invite code
 */
export const createInvite = async (role: UserRole): Promise<InviteCode> => {
  // Generate a random code
  const code = Math.random().toString(36).substring(2, 15) +
               Math.random().toString(36).substring(2, 15);

  const { data, error } = await supabase
    .from('invite_codes')
    .insert({
      code,
      role,
      is_used: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invite code: ${error.message}`);
  }

  return data;
};

/**
 * Delete an invite code
 */
export const deleteInvite = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('invite_codes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete invite code: ${error.message}`);
  }
};
