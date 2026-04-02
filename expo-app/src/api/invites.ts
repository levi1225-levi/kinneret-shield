import client from './client';
import { InviteCode, UserRole, PaginatedResponse, PaginationParams } from '../types';

/**
 * Get all invite codes with pagination
 */
export const getInvites = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<InviteCode>> => {
  const response = await client.get<PaginatedResponse<InviteCode>>(
    '/invites',
    { params: pagination }
  );
  return response.data;
};

/**
 * Get unused invite codes
 */
export const getUnusedInvites = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<InviteCode>> => {
  const response = await client.get<PaginatedResponse<InviteCode>>(
    '/invites/unused',
    { params: pagination }
  );
  return response.data;
};

/**
 * Get invite details by code
 */
export const getInviteByCode = async (code: string): Promise<InviteCode> => {
  const response = await client.get<InviteCode>(`/invites/code/${code}`);
  return response.data;
};

/**
 * Create a new invite code
 */
export const createInvite = async (role: UserRole): Promise<InviteCode> => {
  const response = await client.post<InviteCode>('/invites', { role });
  return response.data;
};

/**
 * Delete an invite code
 */
export const deleteInvite = async (id: string): Promise<void> => {
  await client.delete(`/invites/${id}`);
};
