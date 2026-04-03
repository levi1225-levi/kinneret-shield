import { supabase } from '../lib/supabase';
import {
  AttendanceRecord,
  PaginatedResponse,
  AttendanceFilter,
  PaginationParams,
  DailyReport,
} from '../types';

const PAGE_SIZE = 50;

/**
 * Get attendance records with optional filters and pagination
 */
export const getAttendance = async (
  filters?: AttendanceFilter,
  pagination?: PaginationParams
): Promise<PaginatedResponse<AttendanceRecord>> => {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('attendance_records')
    .select(
      `
      id,
      camper_id,
      room_id,
      device_id,
      nfc_card_id,
      check_in_at,
      check_out_at,
      status,
      duration_minutes,
      created_at,
      updated_at,
      campers(name),
      locations(name)
    `,
      { count: 'exact' }
    );

  // Apply filters
  if (filters?.camper_id) {
    query = query.eq('camper_id', filters.camper_id);
  }
  if (filters?.room_id) {
    query = query.eq('room_id', filters.room_id);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.startDate) {
    query = query.gte('check_in_at', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('check_in_at', filters.endDate);
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch attendance records: ${error.message}`);
  }

  const items = (data || []).map((record: any) => ({
    ...record,
    camper_name: record.campers?.name,
    room_name: record.locations?.name,
  }));

  return {
    items,
    total: count || 0,
    page,
    limit,
    pages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Get attendance records for a specific camper
 */
export const getCamperAttendance = async (
  camperId: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<AttendanceRecord>> => {
  return getAttendance({ camper_id: camperId }, pagination);
};

/**
 * Get attendance records for a specific location
 */
export const getLocationAttendance = async (
  locationId: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<AttendanceRecord>> => {
  return getAttendance({ room_id: locationId }, pagination);
};

/**
 * Get daily attendance report for a location on a specific date
 */
export const getDailyReport = async (
  locationId: string,
  date: string
): Promise<DailyReport> => {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('room_id', locationId)
    .eq('date', date)
    .single();

  if (error) {
    throw new Error(`Failed to fetch daily report: ${error.message}`);
  }

  return data;
};

/**
 * Generate daily attendance reports (call RPC or compute from attendance)
 */
export const generateDailyReports = async (): Promise<{ count: number }> => {
  // Call the generate_daily_reports RPC function
  const { data, error } = await supabase.rpc('generate_daily_reports');

  if (error) {
    throw new Error(`Failed to generate daily reports: ${error.message}`);
  }

  return data || { count: 0 };
};

/**
 * Auto-checkout campers who have been checked in beyond config timeout
 */
export const autoCheckout = async (): Promise<{ count: number }> => {
  // Call the auto_checkout RPC function
  const { data, error } = await supabase.rpc('auto_checkout');

  if (error) {
    throw new Error(`Failed to auto-checkout: ${error.message}`);
  }

  return data || { count: 0 };
};
