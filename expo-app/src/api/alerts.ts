import { supabase } from '../lib/supabase';
import {
  Alert,
  EmergencyEvent,
  AlertFilter,
  AlertSeverity,
  EmergencyEventType,
  PaginatedResponse,
  PaginationParams,
} from '../types';

const PAGE_SIZE = 50;

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
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('alerts')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }
  if (filters?.room_id) {
    query = query.eq('room_id', filters.room_id);
  }
  if (filters?.device_id) {
    query = query.eq('device_id', filters.device_id);
  }
  if (filters?.resolved !== undefined) {
    query = query.eq('resolved', filters.resolved);
  }

  // Apply pagination and ordering
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch alerts: ${error.message}`);
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
 * Get unresolved alerts
 */
export const getUnresolvedAlerts = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<Alert>> => {
  return getAlerts({ resolved: false }, pagination);
};

/**
 * Resolve an alert
 */
export const resolveAlert = async (id: string): Promise<Alert> => {
  const { data, error } = await supabase
    .from('alerts')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to resolve alert: ${error.message}`);
  }

  return data;
};

/**
 * Initiate an emergency event
 */
export const initiateEmergency = async (data: {
  type: EmergencyEventType;
  message: string;
}): Promise<EmergencyEvent> => {
  const { data: result, error } = await supabase
    .from('emergency_events')
    .insert({
      type: data.type,
      message: data.message,
      active: true,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to initiate emergency: ${error.message}`);
  }

  return result;
};

/**
 * End an emergency event
 */
export const endEmergency = async (eventId: string): Promise<EmergencyEvent> => {
  const { data, error } = await supabase
    .from('emergency_events')
    .update({
      active: false,
      ended_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to end emergency: ${error.message}`);
  }

  return data;
};

/**
 * Get active emergency events
 */
export const getActiveEmergencies = async (): Promise<EmergencyEvent[]> => {
  const { data, error } = await supabase
    .from('emergency_events')
    .select('*')
    .eq('active', true);

  if (error) {
    throw new Error(`Failed to fetch active emergencies: ${error.message}`);
  }

  return data || [];
};
