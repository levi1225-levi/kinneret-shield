/**
 * Mock data for demo mode - provides realistic sample data
 * when no backend is available
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

// ─── Demo Users ───
export const DEMO_USERS: Record<UserRole, User> = {
  student: {
    id: 'usr-0001',
    email: 'sarah.cohen@tanenbaumchat.org',
    name: 'Sarah Cohen',
    role: 'student',
    avatar_url: undefined,
    is_active: true,
    created_at: iso(120),
    updated_at: iso(0),
  },
  teacher: {
    id: 'usr-0002',
    email: 'david.levy@tanenbaumchat.org',
    name: 'David Levy',
    role: 'teacher',
    avatar_url: undefined,
    is_active: true,
    created_at: iso(200),
    updated_at: iso(0),
  },
  security_guard: {
    id: 'usr-0003',
    email: 'michael.berg@tanenbaumchat.org',
    name: 'Michael Berg',
    role: 'security_guard',
    avatar_url: undefined,
    is_active: true,
    created_at: iso(300),
    updated_at: iso(0),
  },
  management: {
    id: 'usr-0004',
    email: 'rachel.gold@tanenbaumchat.org',
    name: 'Rachel Gold',
    role: 'management',
    avatar_url: undefined,
    is_active: true,
    created_at: iso(365),
    updated_at: iso(0),
  },
  parent: {
    id: 'usr-0005',
    email: 'jonathan.cohen@gmail.com',
    name: 'Jonathan Cohen',
    role: 'parent',
    avatar_url: undefined,
    is_active: true,
    created_at: iso(100),
    updated_at: iso(0),
  },
};

// ─── Rooms ───
export const MOCK_ROOMS: Room[] = [
  { id: 'rm-0001', name: 'Room 201', building: 'Main Building', floor: 2, room_number: '201', type: 'classroom', capacity: 30, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0002', name: 'Room 202', building: 'Main Building', floor: 2, room_number: '202', type: 'classroom', capacity: 30, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0003', name: 'Room 301', building: 'Main Building', floor: 3, room_number: '301', type: 'lab', capacity: 24, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0004', name: 'Library', building: 'Main Building', floor: 1, room_number: '101', type: 'library', capacity: 60, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0005', name: 'Gymnasium', building: 'Sports Wing', floor: 1, room_number: 'G1', type: 'gym', capacity: 100, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0006', name: 'Cafeteria', building: 'Main Building', floor: 1, room_number: '102', type: 'cafeteria', capacity: 150, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0007', name: 'Room 303', building: 'Main Building', floor: 3, room_number: '303', type: 'classroom', capacity: 28, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0008', name: 'Music Room', building: 'Arts Wing', floor: 1, room_number: 'A1', type: 'classroom', capacity: 20, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0009', name: 'Science Lab', building: 'Main Building', floor: 3, room_number: '302', type: 'lab', capacity: 24, created_at: iso(365), updated_at: iso(0) },
  { id: 'rm-0010', name: 'Admin Office', building: 'Main Building', floor: 1, room_number: '100', type: 'office', capacity: 10, created_at: iso(365), updated_at: iso(0) },
];

// ─── Room Occupancies ───
export const MOCK_OCCUPANCIES: RoomOccupancy[] = MOCK_ROOMS.map((room) => {
  const current = Math.floor(Math.random() * room.capacity * 0.8);
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
  { id: 'dev-0001', room_id: 'rm-0001', serial_number: 'KS-2024-001', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 40), config: {}, created_at: iso(90), updated_at: iso(0) },
  { id: 'dev-0002', room_id: 'rm-0002', serial_number: 'KS-2024-002', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 38), config: {}, created_at: iso(90), updated_at: iso(0) },
  { id: 'dev-0003', room_id: 'rm-0003', serial_number: 'KS-2024-003', firmware_version: '1.1.5', status: 'online', last_heartbeat: iso(0, 13, 41), config: {}, created_at: iso(85), updated_at: iso(0) },
  { id: 'dev-0004', room_id: 'rm-0004', serial_number: 'KS-2024-004', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 35), config: {}, created_at: iso(80), updated_at: iso(0) },
  { id: 'dev-0005', room_id: 'rm-0005', serial_number: 'KS-2024-005', firmware_version: '1.2.0', status: 'offline', last_heartbeat: iso(1, 16, 0), config: {}, created_at: iso(75), updated_at: iso(1) },
  { id: 'dev-0006', room_id: 'rm-0006', serial_number: 'KS-2024-006', firmware_version: '1.1.5', status: 'online', last_heartbeat: iso(0, 13, 39), config: {}, created_at: iso(70), updated_at: iso(0) },
  { id: 'dev-0007', room_id: 'rm-0007', serial_number: 'KS-2024-007', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 42), config: {}, created_at: iso(65), updated_at: iso(0) },
  { id: 'dev-0008', room_id: 'rm-0008', serial_number: 'KS-2024-008', firmware_version: '1.0.0', status: 'error', last_heartbeat: iso(3, 10, 0), config: {}, created_at: iso(60), updated_at: iso(3) },
  { id: 'dev-0009', room_id: 'rm-0009', serial_number: 'KS-2024-009', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 37), config: {}, created_at: iso(55), updated_at: iso(0) },
  { id: 'dev-0010', room_id: 'rm-0010', serial_number: 'KS-2024-010', firmware_version: '1.2.0', status: 'online', last_heartbeat: iso(0, 13, 36), config: {}, created_at: iso(50), updated_at: iso(0) },
];

// ─── Student names for attendance records ───
const STUDENT_NAMES = [
  'Sarah Cohen', 'Noah Friedman', 'Emma Goldberg', 'Liam Rosen',
  'Olivia Schwartz', 'Ethan Weiss', 'Ava Katz', 'Jacob Miller',
  'Mia Stern', 'Daniel Green', 'Sophia Klein', 'Benjamin Adler',
  'Isabella Berger', 'Alexander Wolf', 'Charlotte Diamond',
];

// ─── Attendance Records ───
function generateAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  let counter = 1;

  // Today's records
  for (let i = 0; i < 6; i++) {
    const roomIdx = i % MOCK_ROOMS.length;
    const studentIdx = i % STUDENT_NAMES.length;
    const checkInHour = 8 + Math.floor(i * 0.8);
    const hasCheckedOut = i < 4;
    records.push({
      id: id('att', counter++),
      student_id: i === 0 ? 'usr-0001' : id('usr', 100 + i),
      room_id: MOCK_ROOMS[roomIdx].id,
      device_id: MOCK_DEVICES[roomIdx].id,
      nfc_card_id: id('nfc', i + 1),
      check_in_at: iso(0, checkInHour, 5 + i * 3),
      check_out_at: hasCheckedOut ? iso(0, checkInHour + 1, 45 + i * 2) : undefined,
      status: hasCheckedOut ? 'checked_out' : 'checked_in',
      duration_minutes: hasCheckedOut ? 90 + i * 5 : undefined,
      created_at: iso(0, checkInHour, 5 + i * 3),
      updated_at: iso(0),
      student_name: i === 0 ? 'Sarah Cohen' : STUDENT_NAMES[studentIdx],
      room_name: MOCK_ROOMS[roomIdx].name,
    });
  }

  // Yesterday's records
  for (let i = 0; i < 5; i++) {
    const roomIdx = (i + 2) % MOCK_ROOMS.length;
    const studentIdx = (i + 3) % STUDENT_NAMES.length;
    records.push({
      id: id('att', counter++),
      student_id: i === 0 ? 'usr-0001' : id('usr', 100 + i),
      room_id: MOCK_ROOMS[roomIdx].id,
      device_id: MOCK_DEVICES[roomIdx].id,
      nfc_card_id: id('nfc', i + 1),
      check_in_at: iso(1, 8 + i, 10),
      check_out_at: iso(1, 9 + i, 50),
      status: 'checked_out',
      duration_minutes: 100 + i * 10,
      created_at: iso(1, 8 + i, 10),
      updated_at: iso(1),
      student_name: i === 0 ? 'Sarah Cohen' : STUDENT_NAMES[studentIdx],
      room_name: MOCK_ROOMS[roomIdx].name,
    });
  }

  // Older records (2-7 days ago)
  for (let day = 2; day <= 7; day++) {
    for (let i = 0; i < 4; i++) {
      const roomIdx = (day + i) % MOCK_ROOMS.length;
      const studentIdx = (day + i + 1) % STUDENT_NAMES.length;
      records.push({
        id: id('att', counter++),
        student_id: i === 0 ? 'usr-0001' : id('usr', 100 + i),
        room_id: MOCK_ROOMS[roomIdx].id,
        device_id: MOCK_DEVICES[roomIdx].id,
        nfc_card_id: id('nfc', i + 1),
        check_in_at: iso(day, 8 + i, 15),
        check_out_at: iso(day, 9 + i, 45),
        status: day === 5 && i === 0 ? 'auto_checked_out' : 'checked_out',
        duration_minutes: 90 + i * 15,
        created_at: iso(day, 8 + i, 15),
        updated_at: iso(day),
        student_name: i === 0 ? 'Sarah Cohen' : STUDENT_NAMES[studentIdx],
        room_name: MOCK_ROOMS[roomIdx].name,
      });
    }
  }

  return records;
}

export const MOCK_ATTENDANCE: AttendanceRecord[] = generateAttendanceRecords();

// ─── Alerts ───
export const MOCK_ALERTS: Alert[] = [
  { id: 'alrt-0001', type: 'device_offline', severity: 'medium', room_id: 'rm-0005', device_id: 'dev-0005', message: 'Device KS-2024-005 in Gymnasium went offline', data: {}, resolved: false, created_at: iso(0, 10, 15) },
  { id: 'alrt-0002', type: 'unknown_card', severity: 'high', room_id: 'rm-0001', device_id: 'dev-0001', user_id: undefined, message: 'Unregistered NFC card detected at Room 201', data: { card_id: 'UNKNOWN-44AF' }, resolved: false, created_at: iso(0, 9, 30) },
  { id: 'alrt-0003', type: 'capacity_exceeded', severity: 'medium', room_id: 'rm-0008', message: 'Music Room capacity exceeded (22/20)', data: { current: 22, max: 20 }, resolved: false, created_at: iso(0, 11, 0) },
  { id: 'alrt-0004', type: 'device_offline', severity: 'high', room_id: 'rm-0008', device_id: 'dev-0008', message: 'Device KS-2024-008 in Music Room has error status', data: {}, resolved: false, created_at: iso(3, 10, 5) },
  { id: 'alrt-0005', type: 'unauthorized_access', severity: 'critical', room_id: 'rm-0010', message: 'Unauthorized access attempt at Admin Office after hours', data: { time: '22:15' }, resolved: true, resolved_by: 'usr-0003', resolved_at: iso(1, 22, 30), created_at: iso(1, 22, 15) },
  { id: 'alrt-0006', type: 'device_offline', severity: 'low', room_id: 'rm-0003', device_id: 'dev-0003', message: 'Brief connectivity loss on device KS-2024-003', data: {}, resolved: true, resolved_by: 'usr-0003', resolved_at: iso(2, 14, 0), created_at: iso(2, 13, 45) },
];

// ─── Invite Codes ───
export const MOCK_INVITES: InviteCode[] = [
  { id: 'inv-0001', code: 'TEACH-2024-ABC', role: 'teacher', created_by: 'usr-0004', expires_at: iso(-7), created_at: iso(14), is_used: false, is_expired: false },
  { id: 'inv-0002', code: 'STU-2024-XYZ', role: 'student', created_by: 'usr-0004', used_by: 'usr-0006', used_at: iso(5), expires_at: iso(-30), created_at: iso(20), is_used: true, is_expired: false },
  { id: 'inv-0003', code: 'PAR-2024-QRS', role: 'parent', created_by: 'usr-0004', expires_at: iso(-3), created_at: iso(10), is_used: false, is_expired: false },
  { id: 'inv-0004', code: 'SEC-2024-DEF', role: 'security_guard', created_by: 'usr-0004', expires_at: iso(-14), created_at: iso(21), is_used: false, is_expired: true },
];

// ─── All Users (for management view) ───
export const MOCK_ALL_USERS: User[] = [
  DEMO_USERS.student,
  DEMO_USERS.teacher,
  DEMO_USERS.security_guard,
  DEMO_USERS.management,
  DEMO_USERS.parent,
  { id: 'usr-0101', email: 'noah.friedman@tanenbaumchat.org', name: 'Noah Friedman', role: 'student', is_active: true, created_at: iso(100), updated_at: iso(0) },
  { id: 'usr-0102', email: 'emma.goldberg@tanenbaumchat.org', name: 'Emma Goldberg', role: 'student', is_active: true, created_at: iso(95), updated_at: iso(0) },
  { id: 'usr-0103', email: 'liam.rosen@tanenbaumchat.org', name: 'Liam Rosen', role: 'student', is_active: true, created_at: iso(90), updated_at: iso(0) },
  { id: 'usr-0104', email: 'olivia.schwartz@tanenbaumchat.org', name: 'Olivia Schwartz', role: 'student', is_active: false, created_at: iso(85), updated_at: iso(10) },
  { id: 'usr-0105', email: 'ethan.weiss@tanenbaumchat.org', name: 'Ethan Weiss', role: 'student', is_active: true, created_at: iso(80), updated_at: iso(0) },
  { id: 'usr-0106', email: 'ava.katz@tanenbaumchat.org', name: 'Ava Katz', role: 'student', is_active: true, created_at: iso(75), updated_at: iso(0) },
  { id: 'usr-0107', email: 'miriam.shapiro@tanenbaumchat.org', name: 'Miriam Shapiro', role: 'teacher', is_active: true, created_at: iso(200), updated_at: iso(0) },
  { id: 'usr-0108', email: 'yosef.ben-david@tanenbaumchat.org', name: 'Yosef Ben-David', role: 'teacher', is_active: true, created_at: iso(180), updated_at: iso(0) },
  { id: 'usr-0109', email: 'daniel.green@tanenbaumchat.org', name: 'Daniel Green', role: 'parent', is_active: true, created_at: iso(70), updated_at: iso(0) },
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
  getMe: (role: UserRole) => DEMO_USERS[role],

  // Attendance
  getAttendance: (page = 1, limit = 20) => paginate(MOCK_ATTENDANCE, page, limit),

  getStudentAttendance: (studentId: string, page = 1, limit = 20) => {
    const filtered = MOCK_ATTENDANCE.filter((r) => r.student_id === studentId || studentId === 'usr-0001');
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
