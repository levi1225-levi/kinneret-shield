import client from './client';
import {
  AttendanceRecord,
  PaginatedResponse,
  AttendanceFilter,
  PaginationParams,
  DailyReport,
} from '../types';

/**
 * Get attendance records with optional filters and pagination
 */
export const getAttendance = async (
  filters?: AttendanceFilter,
  pagination?: PaginationParams
): Promise<PaginatedResponse<AttendanceRecord>> => {
  const params = {
    ...filters,
    ...pagination,
  };
  const response = await client.get<PaginatedResponse<AttendanceRecord>>(
    '/attendance',
    { params }
  );
  return response.data;
};

/**
 * Get attendance records for a specific student
 */
export const getStudentAttendance = async (
  studentId: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<AttendanceRecord>> => {
  const response = await client.get<PaginatedResponse<AttendanceRecord>>(
    `/attendance/student/${studentId}`,
    { params: pagination }
  );
  return response.data;
};

/**
 * Get attendance records for a specific room
 */
export const getRoomAttendance = async (
  roomId: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<AttendanceRecord>> => {
  const response = await client.get<PaginatedResponse<AttendanceRecord>>(
    `/attendance/room/${roomId}`,
    { params: pagination }
  );
  return response.data;
};

/**
 * Get daily attendance report for a room on a specific date
 */
export const getDailyReport = async (
  roomId: string,
  date: string
): Promise<DailyReport> => {
  const response = await client.get<DailyReport>(
    `/attendance/daily-report/${roomId}`,
    { params: { date } }
  );
  return response.data;
};

/**
 * Generate daily attendance reports
 */
export const generateDailyReports = async (): Promise<{ count: number }> => {
  const response = await client.post<{ count: number }>(
    '/attendance/daily-reports/generate'
  );
  return response.data;
};

/**
 * Auto-checkout students who have been in a room beyond a time limit
 */
export const autoCheckout = async (): Promise<{ count: number }> => {
  const response = await client.post<{ count: number }>(
    '/attendance/auto-checkout'
  );
  return response.data;
};
