import { supabase } from '../lib/supabase';
import { PaginatedResponse, PaginationParams } from '../types';

const PAGE_SIZE = 50;

export interface Camper {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cabin?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCamperData {
  name: string;
  email?: string;
  phone?: string;
  cabin?: string;
}

/**
 * Get all campers with pagination
 */
export const getCampers = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<Camper>> => {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('campers')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch campers: ${error.message}`);
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
 * Get a specific camper by ID
 */
export const getCamper = async (id: string): Promise<Camper> => {
  const { data, error } = await supabase
    .from('campers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch camper: ${error.message}`);
  }

  return data;
};

/**
 * Create a new camper
 */
export const createCamper = async (data: CreateCamperData): Promise<Camper> => {
  const { data: result, error } = await supabase
    .from('campers')
    .insert({
      ...data,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create camper: ${error.message}`);
  }

  return result;
};

/**
 * Update a camper
 */
export const updateCamper = async (
  id: string,
  data: Partial<CreateCamperData>
): Promise<Camper> => {
  const { data: result, error } = await supabase
    .from('campers')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update camper: ${error.message}`);
  }

  return result;
};

/**
 * Deactivate a camper
 */
export const deactivateCamper = async (id: string): Promise<Camper> => {
  const { data, error } = await supabase
    .from('campers')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to deactivate camper: ${error.message}`);
  }

  return data;
};
