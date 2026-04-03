import { supabase } from '../lib/supabase';
import { Device, PaginatedResponse, PaginationParams } from '../types';

const PAGE_SIZE = 50;

/**
 * Get all devices with pagination, joined with locations for names
 */
export const getDevices = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<Device>> => {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('devices')
    .select(
      `
      id,
      room_id,
      serial_number,
      firmware_version,
      status,
      last_heartbeat,
      config,
      created_at,
      updated_at,
      locations(name)
    `,
      { count: 'exact' }
    )
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch devices: ${error.message}`);
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
 * Get a specific device by ID with location information
 */
export const getDevice = async (id: string): Promise<Device> => {
  const { data, error } = await supabase
    .from('devices')
    .select(
      `
      id,
      room_id,
      serial_number,
      firmware_version,
      status,
      last_heartbeat,
      config,
      created_at,
      updated_at,
      locations(name)
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch device: ${error.message}`);
  }

  return data;
};

/**
 * Get all devices in a specific location
 */
export const getDevicesByLocation = async (locationId: string): Promise<Device[]> => {
  const { data, error } = await supabase
    .from('devices')
    .select(
      `
      id,
      room_id,
      serial_number,
      firmware_version,
      status,
      last_heartbeat,
      config,
      created_at,
      updated_at,
      locations(name)
    `
    )
    .eq('room_id', locationId);

  if (error) {
    throw new Error(`Failed to fetch devices by location: ${error.message}`);
  }

  return data || [];
};

/**
 * Update device configuration
 */
export const updateDeviceConfig = async (
  id: string,
  config: Record<string, any>
): Promise<Device> => {
  const { data, error } = await supabase
    .from('devices')
    .update({ config })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update device config: ${error.message}`);
  }

  return data;
};
