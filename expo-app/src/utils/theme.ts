export const Colors = {
  primary: '#1E3A8A',
  primaryLight: '#3B82F6',
  accent: '#0EA5E9',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  info: '#6366F1',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  statusOnline: '#10B981',
  statusOffline: '#94A3B8',
  statusError: '#EF4444',
  severityLow: '#6366F1',
  severityMedium: '#F59E0B',
  severityHigh: '#F97316',
  severityCritical: '#EF4444',
  attendancePresent: '#10B981',
  attendanceAbsent: '#EF4444',
  attendanceLate: '#F59E0B',
  roleManagement: '#1E3A8A',
  roleCampDirector: '#2563EB',
  roleStaff: '#059669',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  title: 28,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
};

export function getRoleColor(role: string): string {
  switch (role) {
    case 'management': return Colors.roleManagement;
    default: return Colors.textSecondary;
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'low': return Colors.severityLow;
    case 'medium': return Colors.severityMedium;
    case 'high': return Colors.severityHigh;
    case 'critical': return Colors.severityCritical;
    default: return Colors.textSecondary;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'online': return Colors.statusOnline;
    case 'offline': return Colors.statusOffline;
    case 'error': return Colors.statusError;
    case 'checked_in': return Colors.attendancePresent;
    case 'checked_out': return Colors.success;
    case 'auto_checked_out': return Colors.warning;
    default: return Colors.textSecondary;
  }
}
