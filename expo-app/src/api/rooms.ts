import client from './client';
import { Room, RoomOccupancy, PaginatedResponse, PaginationParams } from '../types';

export interface CreateRoomData {
  name: string;
  building: string;
  floor: number;
  room_number: string;
  type: 'classroom' | 'office' | 'gym' | 'library' | 'cafeteria' | 'lab' | 'common_area' | 'other';
  capacity: number;
}

/**
 * Get all rooms with pagination
 */
export const getRooms = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<Room>> => {
  const response = await client.get<PaginatedResponse<Room>>('/rooms', {
    params: pagination,
  });
  return response.data;
};

/**
 * Get a specific room by ID
 */
export const getRoom = async (id: string): Promise<Room> => {
  const response = await client.get<Room>(`/rooms/${id}`);
  return response.data;
};

/**
 * Get rooms in a specific building
 */
export const getRoomsByBuilding = async (
  building: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Room>> => {
  const response = await client.get<PaginatedResponse<Room>>(
    `/rooms/building/${building}`,
    { params: pagination }
  );
  return response.data;
};

/**
 * Get occupancy information for a specific room
 */
export const getRoomOccupancy = async (id: string): Promise<RoomOccupancy> => {
  const response = await client.get<RoomOccupancy>(`/rooms/${id}/occupancy`);
  return response.data;
};

/**
 * Get occupancy information for all rooms
 */
export const getAllOccupancies = async (): Promise<RoomOccupancy[]> => {
  const response = await client.get<RoomOccupancy[]>('/rooms/occupancy');
  return response.data;
};

/**
 * Create a new room
 */
export const createRoom = async (data: CreateRoomData): Promise<Room> => {
  const response = await client.post<Room>('/rooms', data);
  return response.data;
};

/**
 * Update a room
 */
export const updateRoom = async (
  id: string,
  data: Partial<CreateRoomData>
): Promise<Room> => {
  const response = await client.patch<Room>(`/rooms/${id}`, data);
  return response.data;
};

/**
 * Delete a room
 */
export const deleteRoom = async (id: string): Promise<void> => {
  await client.delete(`/rooms/${id}`);
};
