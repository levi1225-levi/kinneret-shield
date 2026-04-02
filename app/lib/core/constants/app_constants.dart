import 'package:flutter/material.dart';

class AppConstants {
  // App Info
  static const String appName = 'Kinneret Shield';
  static const String appVersion = '1.0.0';

  // API Configuration
  static const String baseUrl = 'https://api.kinneretshield.local';
  static const String supabaseUrl = 'https://your-project.supabase.co';
  static const String supabaseAnonKey = 'your-anon-key';

  // Google Sign-In
  static const String googleClientId = 'your-google-client-id.apps.googleusercontent.com';
  static const String googleWebClientId = 'your-web-client-id.apps.googleusercontent.com';

  // WebSocket
  static const String websocketUrl = 'wss://api.kinneretshield.local/ws';

  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration websocketTimeout = Duration(seconds: 5);

  // Pagination
  static const int pageSize = 20;
  static const int initialPageSize = 50;

  // Themes Colors
  static const Color primaryBlue = Color(0xFF1E3A8A);
  static const Color primaryBlueLight = Color(0xFF3B82F6);
  static const Color accentBlue = Color(0xFF0EA5E9);
  static const Color neutralWhite = Color(0xFFFFFFFF);
  static const Color neutralGray = Color(0xFFF3F4F6);
  static const Color darkGray = Color(0xFF1F2937);

  // Status Colors
  static const Color presentGreen = Color(0xFF10B981);
  static const Color absentRed = Color(0xFFEF4444);
  static const Color lateYellow = Color(0xFFFCD34D);
  static const Color unknownGray = Color(0xFF9CA3AF);

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'current_user';
  static const String refreshTokenKey = 'refresh_token';
  static const String inviteCodeKey = 'invite_code';

  // Role strings
  static const String roleStudent = 'student';
  static const String roleParent = 'parent';
  static const String roleTeacher = 'teacher';
  static const String roleSecurityGuard = 'security_guard';
  static const String roleManagement = 'management';

  // Alert Severity
  static const String severityInfo = 'info';
  static const String severityWarning = 'warning';
  static const String severityError = 'error';
  static const String severityCritical = 'critical';

  // Device Status
  static const String deviceOnline = 'online';
  static const String deviceOffline = 'offline';
  static const String deviceError = 'error';

  // Emergency Status
  static const String emergencyActive = 'active';
  static const String emergencyResolved = 'resolved';
  static const String emergencyInProgress = 'in_progress';
}
