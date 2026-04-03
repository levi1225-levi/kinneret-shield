/**
 * Mock data for demo mode - provides realistic sample data
 * when no backend is available
 *
 * Camp Northland - Management-only app
 */
import {
  User,
  UserRole,
  Room,
  RoomOccupancy,
  Device,
  AttendanceRecord,
  Alert,
  EmergencyEvent,
  InviteCode,
  DailyReport,
  PaginatedResponse,
} from '../types';

// ─── Helper ───
const id = (prefix: string, n: number) => `${prefix}-${String(n).padStart(4, '0')}`;
const iso = (daysAgo: number, hours = 8, mins = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
};
const todayISO = () => new Date().toISOString().split('T')[0];

// ─── Demo Users (Management Only) ───
export const DEMO_USERS: Record<'management', User> = {
  management: {
    id: 'usr-0001',
    email: 'rachel.gold@campnorthland.com',
    name: 'Rachel Gold',
    role: 'management',
    avatar_url: undefined,
    is_active: true,
    created_at: iso(365),
    updated_at: iso(0),
  },
};

// ─── Rooms (Camp Locations) ───
export const MOCK_ROOMS: Room[] = [
  { id: 'rm-0001', name: 'Waterfront', area: 'Lake Zone', floor: 1, location_code: 'WF-01', type: 'waterfront', capacity: 40, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0002', name: 'Cabin 1', area: 'Cabin Row', floor: 1, location_code: 'CB-01', type: 'cabin', capacity: 12, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0003', name: 'Cabin 2', area: 'Cabin Row', floor: 1, location_code: 'CB-02', type: 'cabin', capacity: 12, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0004', name: 'Cabin 3', area: 'Cabin Row', floor: 1, location_code: 'CB-03', type: 'cabin', capacity: 12, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0005', name: 'Cabin 4', area: 'Cabin Row', floor: 1, location_code: 'CB-04', type: 'cabin', capacity: 12, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0006', name: 'Cabin 5', area: 'Cabin Row', floor: 1, location_code: 'CB-05', type: 'cabin', capacity: 12, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0007', name: 'Cabin 6', area: 'Cabin Row', floor: 1, location_code: 'CB-06', type: 'cabin', capacity: 12, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0008', name: 'Cabin 7', area: 'Cabin Row', floor: 1, location_code: 'CB-07', type: 'cabin', capacity: 12, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0009', name: 'Cabin 8', area: 'Cabin Row', floor: 1, location_code: 'CB-08', type: 'cabin', capacity: 12, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0010', name: 'Dining Hall', area: 'Main Campus', floor: 1, location_code: 'DH-01', type: 'dining_hall', capacity: 200, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0011', name: 'Sports Field', area: 'Athletics Zone', floor: 1, location_code: 'SF-01', type: 'sports_field', capacity: 80, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0012', name: 'Arts & Crafts', area: 'Creative Zone', floor: 1, location_code: 'AC-01', type: 'arts_crafts', capacity: 30, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0013', name: 'Main Office', area: 'Main Campus', floor: 1, location_code: 'MO-01', type: 'main_office', capacity: 15, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0014', name: 'Amphitheatre', area: 'Main Campus', floor: 1, location_code: 'AT-01', type: 'amphitheatre', capacity: 150, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0015', name: 'Canteen', area: 'Main Campus', floor: 1, location_code: 'CN-01', type: 'canteen', capacity: 60, created_at: iso(365), updated_at: iso(0) },
];

// ─── Room Occupancies ───
export const MOCK_OCCUPANCIES: RoomOccupancy[] = MOCK_ROOMS.map((room) => {
  const current = Math.floor(Math.random() * room.capacity * 0.75);
  return {
    roomId: room.id,
    currentOccupancy: current,
    capacity: room.capacity,
    occupancyPercentage: Math.round((current / room.capacity) * 100),
    isAtCapacity: current >= room.capacity,
    timestamp: new Date().toISOString(),
  };
});

// ─── Devices ───
export const MOCK_DEVICES: Device[] = [
  { id: 'dev-0001', room_id: 'rm-0001', serial_number: 'CN-2024-001', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 40), config: {}, created_at: iso(90), updated_at: iso(0) },
  { id: 'dev-0002', room_id: 'rm-0002', serial_number: 'CN-2024-002', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 38), config: {}, created_at: iso(90), updated_at: iso(0) },
  { id: 'dev-0003', room_id: 'rm-0003', serial_number: 'CN-2024-003', firmware_version: '1.1.5', status: 'online', last_heartbeat: iso(0, 13, 41), config: {}, created_at: iso(85), updated_at: iso(0) },
  { id: 'dev-0004', room_id: 'rm-0004', serial_number: 'CN-2024-004', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 35), config: {}, created_at: iso(80), updated_at: iso(0) },
  { id: 'dev-0005', room_id: 'rm-0005', serial_number: 'CN-2024-005', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 39), config: {}, created_at: iso(75), updated_at: iso(0) },
  { id: 'dev-0006', room_id: 'rm-0006', serial_number: 'CN-2024-006', firmware_version: '1.1.5', status: 'online', last_heartbeat: iso(0, 13, 39), config: {}, created_at: iso(70), updated_at: iso(0) },
  { id: 'dev-0007', room_id: 'rm-0007', serial_number: 'CN-2024-007', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 42), config: {}, created_at: iso(65), updated_at: iso(0) },
  { id: 'dev-0008', room_id: 'rm-0008', serial_number: 'CN-2024-008', firmware_version: '1.0.0', status: 'online', last_heartbeat: iso(0, 13, 37), config: {}, created_at: iso(60), updated_at: iso(0) },
  { id: 'dev-0009', room_id: 'rm-0009', serial_number: 'CN-2024-009', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 37), config: {}, created_at: iso(55), updated_at: iso(0) },
  { id: 'dev-0010', room_id: 'rm-0010', serial_number: 'CN-2024-010', firmware_version: '1.2.0', status: 'offline', last_heartbeat: iso(1, 16, 0), config: {}, created_at: iso(50), updated_at: iso(1) },
  { id: 'dev-0011', room_id: 'rm-0011', serial_number: 'CN-2024-011', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 36), config: {}, created_at: iso(45), updated_at: iso(0) },
  { id: 'dev-0012', room_id: 'rm-0012', serial_number: 'CN-2024-012', firmware_version: '1.2.0', status: 'error', last_heartbeat: iso(3, 10, 0), config: {}, created_at: iso(40), updated_at: iso(3) },
  { id: 'dev-0013', room_id: 'rm-0013', serial_number: 'CN-2024-013', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 33), config: {}, created_at: iso(35), updated_at: iso(0) },
  { id: 'dev-0014', room_id: 'rm-0014', serial_number: 'CN-2024-014', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 34), config: {}, created_at: iso(30), updated_at: iso(0) },
  { id: 'dev-0015', room_id: 'rm-0015', serial_number: 'CN-2024-015', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 32), config: {}, created_at: iso(25), updated_at: iso(0) },
];

// ─── Camper names for attendance records ───
const CAMPER_NAMES = [
  'Jake Thompson', 'Emma Wilson', 'Noah Davis', 'Sophia Martinez',
  'Liam Johnson', 'Olivia Brown', 'Mason Garcia', 'Ava Miller',
  'Ethan Anderson', 'Isabella Taylor', 'Aiden Clark', 'Mia Robinson',
  'Lucas White', 'Charlotte Harris', 'Logan Lewis',
];

// ─── Attendance Records ───
function generateAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  let counter = 1;

  // Today's records
  for (let i = 0; i < 8; i++) {
    const roomIdx = i % MOCK_ROOMS.length;
    const camperIdx = i % CAMPER_NAMES.length;
    const checkInHour = 8 + Math.floor(i * 0.6);
    const hasCheckedOut = i < 5;
    records.push({
      id: id('att', counter++),
      camper_id: id('cmp', i + 1),
      room_id: MOCK_ROOMS[roomIdx].id,
      device_id: MOCK_DEVICES[roomIdx].id,
      nfc_card_id: id('nfc', i + 1),
      check_in_at: iso(0, checkInHour, 5 + i * 3),
      check_out_at: hasCheckedOut ? iso(0, checkInHour + 2, 30 + i * 5) : undefined,
      status: hasCheckedOut ? 'checked_out' : 'checked_in',
      duration_minutes: hasCheckedOut ? 150 + i * 10 : undefined,
      created_at: iso(0, checkInHour, 5 + i * 3),
      updated_at: iso(0),
      camper_name: CAMPER_NAMES[camperIdx],
      room_name: MOCK_ROOMS[roomIdx].name,
    });
  }

  // Yesterday's records
  for (let i = 0; i < 7; i++) {
    const roomIdx = (i + 2) % MOCK_ROOMS.length;
    const camperIdx = (i + 3) % CAMPER_NAMES.length;
    records.push({
      id: id('att', counter++),
      camper_id: id('cmp', i + 101),
      room_id: MOCK_ROOMS[roomIdx].id,
      device_id: MOCK_DEVICES[roomIdx].id,
      nfc_card_id: id('nfc', i + 101),
      check_in_at: iso(1, 8 + i, 10),
      check_out_at: iso(1, 10 + i, 50),
      status: 'checked_out',
      duration_minutes: 160 + i * 15,
      created_at: iso(1, 8 + i, 10),
      updated_at: iso(1),
      camper_name: CAMPER_NAMES[camperIdx],
      room_name: MOCK_ROOMS[roomIdx].name,
    });
  }

  // Older records (2-7 days ago)
  for (let day = 2; day <= 7; day++) {
    for (let i = 0; i < 6; i++) {
      const roomIdx = (day + i) % MOCK_ROOMS.length;
      const camperIdx = (day + i + 1) % CAMPER_NAMES.length;
      records.push({
        id: id('att', counter++),
        camper_id: id('cmp', 200 + day * 10 + i),
        room_id: MOCK_ROOMS[roomIdx].id,
        device_id: MOCK_DEVICES[roomIdx].id,
        nfc_card_id: id('nfc', 200 + day * 10 + i),
        check_in_at: iso(day, 8 + i, 15),
        check_out_at: iso(day, 10 + i, 45),
        status: day === 5 && i === 0 ? 'auto_checked_out' : 'checked_out',
        duration_minutes: 150 + i * 20,
        created_at: iso(day, 8 + i, 15),
        updated_at: iso(day),
        camper_name: CAMPER_NAMES[camperIdx],
        room_name: MOCK_ROOMS[roomIdx].name,
      });
    }
  }

  return records;
}

export const MOCK_ATTENDANCE: AttendanceRecord[] = generateAttendanceRecords();

// ─── Alerts ───
export const MOCK_ALERTS: Alert[] = [
  { id: 'alrt-0001', type: 'device_offline', severity: 'high', room_id: 'rm-0001', device_id: 'dev-0001', message: 'Device CN-2024-001 at Waterfront went offline', data: {}, resolved: false, created_at: iso(0, 10, 15) },
  { id: 'alrt-0002', type: 'unknown_card', severity: 'high', room_id: 'rm-0004', device_id: 'dev-0004', user_id: undefined, message: 'Unregistered NFC card detected at Cabin 3', data: { card_id: 'UNKNOWN-55BG' }, resolved: false, created_at: iso(0, 9, 30) },
  { id: 'alrt-0003', type: 'capacity_exceeded', severity: 'medium', room_id: 'rm-0010', message: 'Dining Hall capacity exceeded (210/200)', data: { current: 210, max: 200 }, resolved: false, created_at: iso(0, 11, 0) },
  { id: 'alrt-0004', type: 'device_offline', severity: 'medium', room_id: 'rm-0012', device_id: 'dev-0012', message: 'Device CN-2024-012 at Arts & Crafts has error status', data: {}, resolved: false, created_at: iso(3, 10, 5) },
  { id: 'alrt-0005', type: 'unauthorized_access', severity: 'critical', room_id: 'rm-0013', message: 'Unauthorized access attempt at Main Office after hours', data: { time: '22:15' }, resolved: true, resolved_by: 'usr-0001', resolved_at: iso(1, 22, 30), created_at: iso(1, 22, 15) },
  { id: 'alrt-0006', type: 'device_offline', severity: 'low', room_id: 'rm-0011', device_id: 'dev-0011', message: 'Brief connectivity loss on device CN-2024-011', data: {}, resolved: true, resolved_by: 'usr-0001', resolved_at: iso(2, 14, 0), created_at: iso(2, 13, 45) },
];

// ─── Invite Codes (Management Only) ───
export const MOCK_INVITES: InviteCode[] = [
  { id: 'inv-0001', code: 'MGMT-2024-ABC', role: 'management', created_by: 'usr-0001', expires_at: iso(-7), created_at: iso(14), is_used: false, is_expired: false },
  { id: 'inv-0002', code: 'MGMT-2024-XYZ', role: 'management', created_by: 'usr-0001', used_by: 'usr-0002', used_at: iso(5), expires_at: iso(-30), created_at: iso(20), is_used: true, is_expired: false },
  { id: 'inv-0003', code: 'MGMT-2024-QRS', role: 'management', created_by: 'usr-0001', expires_at: iso(-3), created_at: iso(10), is_used: false, is_expired: true },
];

// ─── All Users (Management Staff) ───
export const MOCK_ALL_USERS: User[] = [
  DEMO_USERS.management,
  { id: 'usr-0002', email: 'david.levy@campnorthland.com', name: 'David Levy', role: 'management', is_active: true, created_at: iso(200), updated_at: iso(0) },
  { id: 'usr-0003', email: 'michael.berg@campnorthland.com', name: 'Michael Berg', role: 'management', is_active: true, created_at: iso(300), updated_at: iso(0) },
  { id: 'usr-0004', email: 'sarah.cohen@campnorthland.com', name: 'Sarah Cohen', role: 'management', is_active: true, created_at: iso(100), updated_at: iso(0) },
  { id: 'usr-0005', email: 'jonathan.price@campnorthland.com', name: 'Jonathan Price', role: 'management', is_active: true, created_at: iso(250), updated_at: iso(0) },
  { id: 'usr-0006', email: 'hannah.stone@campnorthland.com', name: 'Hannah Stone', role: 'management', is_active: true, created_at: iso(150), updated_at: iso(0) },
];

// ─── Paginated helper ───
export function paginate<T>(items: T[], page = 1, limit = 20): PaginatedResponse<T> {
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);
  return {
    items: paged,
    total: items.length,
    page,
    limit,
    pages: Math.ceil(items.length / limit),
  };
}

// ─── Mock API functions ───
export const mockAPI = {
  // Auth
  getMe: () => DEMO_USERS.management,

  // Attendance
  getAttendance: (page = 1, limit = 20) => paginate(MOCK_ATTENDANCE, page, limit),

  getCamperAttendance: (camperId: string, page = 1, limit = 20) => {
    const filtered = MOCK_ATTENDANCE.filter((r) => r.camper_id === camperId);
    return paginate(filtered, page, limit);
  },

  getRoomAttendance: (roomId: string, page = 1, limit = 20) => {
    const filtered = MOCK_ATTENDANCE.filter((r) => r.room_id === roomId);
    return paginate(filtered, page, limit);
  },

  // Rooms
  getRooms: (page = 1, limit = 20) => paginate(MOCK_ROOMS, page, limit),
  getAllOccupancies: () => MOCK_OCCUPANCIES,

  // Devices
  getDevices: (page = 1, limit = 20) => paginate(MOCK_DEVICES, page, limit),

  // Alerts
  getAlerts: (page = 1, limit = 20) => paginate(MOCK_ALERTS, page, limit),
  getUnresolvedAlerts: (page = 1, limit = 20) => {
    const unresolved = MOCK_ALERTS.filter((a) => !a.resolved);
    return paginate(unresolved, page, limit);
  },
  getActiveEmergencies: (): EmergencyEvent[] => [],

  // Users
  getUsers: (page = 1, limit = 100) => paginate(MOCK_ALL_USERS, page, limit),

  // Invites
  getInvites: (page = 1, limit = 100) => paginate(MOCK_INVITES, page, limit),
};
