import client from './client';
import { Device, PaginatedResponse, PaginationParams } from '../types';

/**
 * Get all devices with pagination
 */
export const getDevices = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<Device>> => {
  const response = await client.get<PaginatedResponse<Device>>('/devices', {
    params: pagination,
  });
  return response.data;
};

/**
 * Get a specific device by ID
 */
export const getDevice = async (id: string): Promise<Device> => {
  const response = await client.get<Device>(`/devices/${id}`);
  return response.data;
};

/**
 * Get all devices in a specific room
 */
export const getDevicesByRoom = async (
  roomId: string
): Promise<Device[]> => {
  const response = await client.get<Device[]>(`/devices/room/${roomId}`);
  return response.data;
};

/**
 * Update device configuration
 */
export const updateDeviceConfig = async (
  id: string,
  config: Record<string, any>
): Promise<Device> => {
  const response = await client.patch<Device>(`/devices/${id}/config`, {
    config,
  });
  return response.data;
};
