import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../constants/app_constants.dart';
import '../models/user.dart';
import '../providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/dashboard/screens/student_dashboard.dart';
import '../../features/dashboard/screens/teacher_dashboard.dart';
import '../../features/dashboard/screens/security_dashboard.dart';
import '../../features/dashboard/screens/management_dashboard.dart';
import '../../features/dashboard/screens/parent_dashboard.dart';
import '../../features/attendance/screens/attendance_list_screen.dart';
import '../../features/attendance/screens/attendance_detail_screen.dart';
import '../../features/rooms/screens/rooms_list_screen.dart';
import '../../features/rooms/screens/room_detail_screen.dart';
import '../../features/devices/screens/devices_list_screen.dart';
import '../../features/devices/screens/device_detail_screen.dart';
import '../../features/alerts/screens/alerts_screen.dart';
import '../../features/admin/screens/admin_panel_screen.dart';
import '../../features/profile/screens/profile_screen.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(currentUserProvider);

  return GoRouter(
    initialLocation: '/login',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isAuth = authState.maybeWhen(
        data: (user) => user != null,
        orElse: () => false,
      );

      final isSplash = state.uri.path == '/';
      final isLogin = state.uri.path == '/login';
      final isRegister = state.uri.path == '/register';

      if (!isAuth) {
        if (isLogin || isRegister) {
          return null;
        }
        return '/login';
      } else {
        if (isLogin || isRegister || isSplash) {
          return _getDefaultDashboard(authState);
        }
      }

      return null;
    },
    routes: [
      // Auth Routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),

      // Dashboard Routes (role-specific)
      GoRoute(
        path: '/dashboard/student',
        builder: (context, state) => const StudentDashboard(),
      ),
      GoRoute(
        path: '/dashboard/teacher',
        builder: (context, state) => const TeacherDashboard(),
      ),
      GoRoute(
        path: '/dashboard/security',
        builder: (context, state) => const SecurityDashboard(),
      ),
      GoRoute(
        path: '/dashboard/management',
        builder: (context, state) => const ManagementDashboard(),
      ),
      GoRoute(
        path: '/dashboard/parent',
        builder: (context, state) => const ParentDashboard(),
      ),

      // Attendance Routes
      GoRoute(
        path: '/attendance',
        builder: (context, state) => const AttendanceListScreen(),
      ),
      GoRoute(
        path: '/attendance/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return AttendanceDetailScreen(recordId: id);
        },
      ),

      // Rooms Routes
      GoRoute(
        path: '/rooms',
        builder: (context, state) => const RoomsListScreen(),
      ),
      GoRoute(
        path: '/rooms/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return RoomDetailScreen(roomId: id);
        },
      ),

      // Devices Routes
      GoRoute(
        path: '/devices',
        builder: (context, state) => const DevicesListScreen(),
      ),
      GoRoute(
        path: '/devices/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return DeviceDetailScreen(deviceId: id);
        },
      ),

      // Alerts Route
      GoRoute(
        path: '/alerts',
        builder: (context, state) => const AlertsScreen(),
      ),

      // Admin Routes
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminPanelScreen(),
      ),

      // Profile Route
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),

      // Emergency Route
      GoRoute(
        path: '/emergency',
        builder: (context, state) => const Scaffold(
          body: Center(
            child: Text('Emergency Response Interface'),
          ),
        ),
      ),
    ],
  );
});

String _getDefaultDashboard(AsyncValue<User?> authState) {
  return authState.maybeWhen(
    data: (user) {
      if (user == null) return '/login';
      switch (user.role) {
        case UserRole.student:
          return '/dashboard/student';
        case UserRole.teacher:
          return '/dashboard/teacher';
        case UserRole.securityGuard:
          return '/dashboard/security';
        case UserRole.management:
          return '/dashboard/management';
        case UserRole.parent:
          return '/dashboard/parent';
      }
    },
    orElse: () => '/login',
  );
  return '/login';
}
