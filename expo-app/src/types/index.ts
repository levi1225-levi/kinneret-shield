// ─── Enums ───
export type UserRole = 'management';
export type DeviceStatus = 'online' | 'offline' | 'error';
export type AttendanceStatus = 'checked_in' | 'checked_out' | 'auto_checked_out';
export type AlertType = 'unauthorized_access' | 'device_offline' | 'capacity_exceeded' | 'unknown_card' | 'emergency';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type EmergencyEventType = 'lockdown' | 'evacuation' | 'drill' | 'all_clear';
export type RoomType = 'waterfront' | 'cabin' | 'dining_hall' | 'sports_field' | 'arts_crafts' | 'main_office' | 'amphitheatre' | 'canteen' | 'other';

// ─── Models ───
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  area: string;
  floor: number;
  location_code: string;
  type: RoomType;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface RoomOccupancy {
  roomId: string;
  currentOccupancy: number;
  capacity: number;
  occupancyPercentage: number;
  isAtCapacity: boolean;
  timestamp: string;
}

export interface Device {
  id: string;
  location_id: string;
  serial_number: string;
  firmware_version: string;
  status: DeviceStatus;
  last_heartbeat?: string;
  config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  camper_id: string;
  location_id: string;
  device_id: string;
  nfc_card_id: string;
  check_in_at: string;
  check_out_at?: string;
  status: AttendanceStatus;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  camper_name?: string;
  room_name?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  location_id?: string;
  device_id?: string;
  user_id?: string;
  message: string;
  data: Record<string, any>;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface EmergencyEvent {
  id: string;
  type: EmergencyEventType;
  initiated_by: string;
  message: string;
  active: boolean;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface InviteCode {
  id: string;
  code: string;
  role: UserRole;
  created_by: string;
  used_by?: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
  is_used: boolean;
  is_expired: boolean;
}

export interface DailyReport {
  id: string;
  date: string;
  location_id: string;
  total_check_ins: number;
  unique_campers: number;
  avg_duration_minutes: number;
  anomalies: any[];
  created_at: string;
}

// ─── API Response Types ───
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuthResponse {
  user: User;
  token: {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

// ─── Filter Types ───
export interface AttendanceFilter {
  camper_id?: string;
  room_id?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
}

export interface AlertFilter {
  type?: AlertType;
  severity?: AlertSeverity;
  location_id?: string;
  device_id?: string;
  resolved?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
