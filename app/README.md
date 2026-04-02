# Kinneret Shield - School NFC Attendance System

A comprehensive Flutter application for managing school attendance using NFC technology. Built for TanenbaumCHAT, Kinneret Shield provides real-time attendance tracking, room occupancy monitoring, and emergency management.

## Features

### Core Functionality
- **Google Sign-In Authentication** - Secure single sign-on integration
- **Invite Code Registration** - Controlled user onboarding with role-based access
- **5 Account Types**:
  - Student - View attendance history and schedule
  - Parent - Monitor child attendance
  - Teacher - Track class attendance and manage students
  - Security Guard - Monitor building occupancy and triggers emergencies
  - Management - Analytics, system administration, and reports

### Real-Time Features
- **Live Occupancy Tracking** - Real-time room occupancy updates via WebSocket
- **Instant Alerts** - Immediate notifications for attendance issues
- **Device Monitoring** - Track NFC reader status and health
- **Emergency Management** - One-click emergency trigger with immediate staff alerts

### Dashboards
- **Student Dashboard** - Daily schedule, attendance summary, recent check-ins
- **Teacher Dashboard** - Class attendance overview, occupancy monitoring, student insights
- **Security Dashboard** - Building-wide occupancy heatmap, active alerts, emergency controls
- **Management Dashboard** - KPI cards, attendance trends, device health, system analytics
- **Parent Dashboard** - Child attendance status, check-in history, timeline view

### Data Management
- **Attendance Records** - Filterable by date, room, student, status
- **Room Management** - Occupancy indicators, capacity tracking, device assignment
- **Device Management** - Status monitoring, configuration, firmware tracking
- **Alerts System** - Severity-based filtering, resolution tracking
- **User Administration** - User management, invite code generation, system settings

## Architecture

### Stack
- **Frontend**: Flutter 3.10+ with Material Design 3
- **State Management**: Riverpod with AsyncNotifier/StateNotifier
- **Navigation**: GoRouter with role-based redirection
- **Data Models**: Freezed for immutable models with JSON serialization
- **HTTP Client**: Dio with JWT interceptor
- **Real-time**: WebSocket for live updates
- **Backend**: NestJS + Supabase

### Project Structure
```
lib/
├── main.dart                          # App entry point
├── core/
│   ├── constants/
│   │   └── app_constants.dart         # Global constants, colors, configs
│   ├── theme/
│   │   └── app_theme.dart             # Material 3 theme setup
│   ├── models/                        # Freezed data models
│   │   ├── user.dart
│   │   ├── room.dart
│   │   ├── student.dart
│   │   ├── teacher.dart
│   │   ├── device.dart
│   │   ├── attendance_record.dart
│   │   ├── alert.dart
│   │   ├── schedule.dart
│   │   ├── invite_code.dart
│   │   ├── notification_model.dart
│   │   ├── emergency_event.dart
│   │   └── daily_report.dart
│   ├── services/
│   │   ├── api_service.dart          # HTTP client with Dio
│   │   ├── auth_service.dart         # Google Sign-In + JWT
│   │   └── websocket_service.dart    # Real-time updates
│   ├── providers/                     # Riverpod state management
│   │   ├── auth_provider.dart
│   │   ├── attendance_provider.dart
│   │   ├── room_provider.dart
│   │   ├── device_provider.dart
│   │   ├── alert_provider.dart
│   │   └── emergency_provider.dart
│   └── router/
│       └── app_router.dart            # GoRouter configuration
├── features/
│   ├── auth/
│   │   └── screens/
│   │       ├── login_screen.dart
│   │       └── register_screen.dart
│   ├── dashboard/
│   │   └── screens/
│   │       ├── student_dashboard.dart
│   │       ├── teacher_dashboard.dart
│   │       ├── security_dashboard.dart
│   │       ├── management_dashboard.dart
│   │       └── parent_dashboard.dart
│   ├── attendance/
│   │   └── screens/
│   │       ├── attendance_list_screen.dart
│   │       └── attendance_detail_screen.dart
│   ├── rooms/
│   │   └── screens/
│   │       ├── rooms_list_screen.dart
│   │       └── room_detail_screen.dart
│   ├── devices/
│   │   └── screens/
│   │       ├── devices_list_screen.dart
│   │       └── device_detail_screen.dart
│   ├── alerts/
│   │   └── screens/
│   │       └── alerts_screen.dart
│   ├── admin/
│   │   └── screens/
│   │       └── admin_panel_screen.dart
│   └── profile/
│       └── screens/
│           └── profile_screen.dart
└── shared/
    └── widgets/
        ├── app_scaffold.dart          # Responsive navigation wrapper
        ├── loading_widget.dart        # Shimmer loading states
        ├── error_widget.dart          # Error and snackbar handlers
        ├── empty_state_widget.dart    # Empty state display
        ├── status_badge.dart          # Status indicators
        └── stat_card.dart             # KPI card component
```

## Getting Started

### Prerequisites
- Flutter 3.10+
- Dart 3.0+
- iOS 12+, Android API 21+

### Environment Setup
1. Clone the repository
2. Create `.env` file with backend configuration:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_WEB_CLIENT_ID=your_web_client_id
   API_BASE_URL=your_backend_url
   ```

### Installation
```bash
# Install dependencies
flutter pub get

# Generate Freezed models
dart run build_runner build

# Run app
flutter run
```

## API Integration

The app integrates with a NestJS backend via:
- **REST API**: Dio HTTP client with JWT authentication
- **WebSocket**: Real-time updates for attendance, alerts, and device status
- **Supabase**: Authentication and realtime database

### Key Endpoints
- `POST /auth/google/signin` - Google authentication
- `POST /auth/register` - Register with invite code
- `GET /attendance` - Fetch attendance records
- `GET /rooms` - List all rooms
- `GET /devices` - List all devices
- `GET /alerts` - Fetch alerts
- `GET /emergency/events` - Emergency event history

## Theme Configuration

The app uses a professional blue and white school theme:
- **Primary Blue**: #1E3A8A
- **Light Blue**: #3B82F6
- **Accent Blue**: #0EA5E9
- **Success Green**: #10B981
- **Warning Yellow**: #FCD34D
- **Error Red**: #EF4444

Customizable in `lib/core/theme/app_theme.dart`

## State Management

Uses Riverpod for reactive state management:
- **Providers**: Read-only data access
- **StateNotifierProvider**: Mutable state with methods
- **FutureProvider**: Async data loading
- **AsyncValue**: Loading/error/data states

Example:
```dart
final currentUserProvider = StateNotifierProvider<CurrentUserNotifier, AsyncValue<User?>>(...);
```

## Navigation

GoRouter provides:
- Automatic role-based redirection
- Deep linking support
- Type-safe route parameters
- Predefined routes for all screens

Protected routes automatically redirect unauthenticated users to login.

## Styling & Responsive Design

- **Mobile**: Bottom navigation bar
- **Tablet/Web**: Side navigation rail
- **Adaptive layouts**: Grid/list views adjust to screen size
- **Material Design 3**: Consistent theming and components

## Dependencies

Key packages:
- `flutter_riverpod` - State management
- `go_router` - Navigation
- `dio` - HTTP client
- `google_sign_in` - Authentication
- `supabase_flutter` - Backend services
- `freezed_annotation` - Model generation
- `fl_chart` - Analytics charts
- `shimmer` - Loading animations
- `web_socket_channel` - Real-time updates

## Development

### Code Generation
```bash
# Generate models and serializers
dart run build_runner build

# Watch mode for development
dart run build_runner watch
```

### Build Release
```bash
# iOS
flutter build ios --release

# Android
flutter build apk --release

# Web
flutter build web --release
```

## Security Considerations

- JWT tokens stored securely in shared_preferences
- Google OAuth 2.0 authentication
- HTTPS/WSS connections required
- Role-based access control enforced server-side
- Sensitive data excluded from logs

## Future Enhancements

- Offline mode with local caching
- Biometric authentication
- Advanced analytics and reporting
- Mobile hotspot for offline NFC reading
- Integration with student information systems
- SMS/Push notification delivery

## Support

For issues and feature requests, contact the development team.

## License

Proprietary - TanenbaumCHAT
