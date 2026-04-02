import client from './client';
import {
  Alert,
  EmergencyEvent,
  AlertFilter,
  AlertSeverity,
  EmergencyEventType,
  PaginatedResponse,
  PaginationParams,
} from '../types';

export interface AlertFilterParams extends AlertFilter {
  page?: number;
  limit?: number;
}

/**
 * Get alerts with optional filters and pagination
 */
export const getAlerts = async (
  filters?: AlertFilter,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Alert>> => {
  const params = {
    ...filters,
    ...pagination,
  };
  const response = await client.get<PaginatedResponse<Alert>>('/alerts', {
    params,
  });
  return response.data;
};

/**
 * Get unresolved alerts
 */
export const getUnresolvedAlerts = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<Alert>> => {
  const response = await client.get<PaginatedResponse<Alert>>(
    '/alerts/unresolved',
    { params: pagination }
  );
  return response.data;
};

/**
 * Get a specific alert by ID
 */
export const getAlert = async (id: string): Promise<Alert> => {
  const response = await client.get<Alert>(`/alerts/${id}`);
  return response.data;
};

/**
 * Resolve an alert
 */
export const resolveAlert = async (
  id: string
): Promise<Alert> => {
  const response = await client.patch<Alert>(`/alerts/${id}/resolve`);
  return response.data;
};

/**
 * Initiate an emergency event
 */
export const initiateEmergency = async (data: {
  type: EmergencyEventType;
  message: string;
}): Promise<EmergencyEvent> => {
  const response = await client.post<EmergencyEvent>(
    '/alerts/emergency/initiate',
    data
  );
  return response.data;
};

/**
 * End an emergency event
 */
export const endEmergency = async (eventId: string): Promise<EmergencyEvent> => {
  const response = await client.post<EmergencyEvent>(
    `/alerts/emergency/${eventId}/end`
  );
  return response.data;
};

/**
 * Get active emergency events
 */
export const getActiveEmergencies = async (): Promise<EmergencyEvent[]> => {
  const response = await client.get<EmergencyEvent[]>(
    '/alerts/emergency/active'
  );
  return response.data;
};

/**
 * Get emergency event history
 */
export const getEmergencyHistory = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<EmergencyEvent>> => {
  const response = await client.get<PaginatedResponse<EmergencyEvent>>(
    '/alerts/emergency/history',
    { params: pagination }
  );
  return response.data;
};
