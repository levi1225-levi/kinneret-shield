import { supabase } from '../lib/supabase';
import { Room, RoomOccupancy, PaginatedResponse, PaginationParams } from '../types';

const PAGE_SIZE = 50;

export interface CreateLocationData {
  name: string;
  area: string;
  floor: number;
  location_code: string;
  type: string;
  capacity: number;
}

/**
 * Get all locations with pagination
 */
export const getLocations = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<Room>> => {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('locations')
    .select('*', { count: 'exact' })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch locations: ${error.message}`);
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
 * Get a specific location by ID
 */
export const getLocation = async (id: string): Promise<Room> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch location: ${error.message}`);
  }

  return data;
};

/**
 * Get all occupancies by calling the RPC function
 */
export const getAllOccupancies = async (): Promise<RoomOccupancy[]> => {
  const { data, error } = await supabase.rpc('get_all_occupancies');

  if (error) {
    throw new Error(`Failed to fetch all occupancies: ${error.message}`);
  }

  return data || [];
};

/**
 * Get occupancy information for a specific location by calling RPC
 */
export const getLocationOccupancy = async (id: string): Promise<RoomOccupancy> => {
  const { data, error } = await supabase.rpc('get_location_occupancy', {
    location_id: id,
  });

  if (error) {
    throw new Error(`Failed to fetch location occupancy: ${error.message}`);
  }

  return data;
};

/**
 * Create a new location
 */
export const createLocation = async (data: CreateLocationData): Promise<Room> => {
  const { data: result, error } = await supabase
    .from('locations')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create location: ${error.message}`);
  }

  return result;
};

/**
 * Update a location
 */
export const updateLocation = async (
  id: string,
  data: Partial<CreateLocationData>
): Promise<Room> => {
  const { data: result, error } = await supabase
    .from('locations')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update location: ${error.message}`);
  }

  return result;
};

/**
 * Delete a location
 */
// Backward-compatible alias for screens that call getRooms
export const getRooms = getLocations;

export const deleteLocation = async (id: string): Promise<void> => {
  const { error } = await supabase.from('locations').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete location: ${error.message}`);
  }
};
