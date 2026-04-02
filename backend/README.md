# Kinneret Shield Backend

Wall-mounted NFC check-in system for school room-level attendance at TanenbaumCHAT.

## Overview

This is a NestJS + Supabase (PostgreSQL) backend API for managing NFC-based attendance tracking across multiple rooms in a school building. The system supports hardware device management, real-time occupancy tracking, alerts, emergency events, and role-based access control.

## Architecture

### Core Components

- **Auth Module**: Google OAuth 2.0 integration with JWT tokens and invite-code-based registration
- **Users Module**: Role-based user management (student, parent, teacher, security_guard, management)
- **Rooms Module**: Physical room management with capacity tracking
- **Devices Module**: NFC reader device registration, heartbeat monitoring, and configuration
- **Attendance Module**: Core NFC tap processing, check-in/check-out logic, and daily reporting
- **Alerts Module**: Real-time alert generation, emergency events, and alert resolution workflow
- **Invites Module**: Invite code generation and management for registration
- **Health Module**: Service health checks and Kubernetes readiness probes

### Technology Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: Passport.js (Google OAuth 2.0, JWT)
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Scheduling**: @nestjs/schedule (cron tasks)
- **Testing**: Jest

## Setup

### Prerequisites

- Node.js >= 18
- npm or yarn
- Supabase account with PostgreSQL database
- Google OAuth 2.0 credentials

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd kinneret-shield/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

4. Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000` and Swagger documentation at `http://localhost:3000/api/docs`

## Environment Variables

Key environment variables (see `.env.example` for complete list):

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `DEVICE_AUTH_SECRET`: Device authentication secret
- `AUTO_CHECKOUT_TIMEOUT`: Auto-checkout timeout in milliseconds (default: 3600000 = 1 hour)
- `DAILY_REPORT_CRON`: Cron expression for daily report generation (default: "0 0 * * *")

## API Endpoints

### Authentication
- `POST /auth/register` - Register with invite code
- `POST /auth/login` - Google OAuth login
- `GET /auth/google` - Initiate Google login
- `GET /auth/google/callback` - Google callback
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/me` - Get current user profile

### Users
- `GET /users` - List users (management only)
- `GET /users/search?q=query` - Search users (management only)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user profile
- `POST /users/:id/deactivate` - Deactivate user (management only)
- `POST /users/:id/activate` - Activate user (management only)

### Rooms
- `POST /rooms` - Create room (management only)
- `GET /rooms` - List rooms
- `GET /rooms/building/:building` - Get rooms by building
- `GET /rooms/:id` - Get room details
- `GET /rooms/:id/occupancy` - Get room occupancy
- `GET /rooms/occupancy` - Get all room occupancies
- `PATCH /rooms/:id` - Update room (management only)
- `DELETE /rooms/:id` - Delete room (management only)

### Devices
- `POST /devices/register` - Register NFC device
- `GET /devices` - List devices
- `GET /devices/:id` - Get device details
- `GET /devices/room/:roomId` - Get devices in room
- `POST /devices/:id/heartbeat` - Device heartbeat (device endpoint)
- `PATCH /devices/:id/config` - Update device config (management only)

### Attendance
- `POST /attendance/tap/:deviceId` - Process NFC tap (device endpoint)
- `GET /attendance` - Get attendance records with filters
- `GET /attendance/student/:studentId` - Get student attendance
- `GET /attendance/room/:roomId` - Get room attendance
- `GET /attendance/daily-report/:roomId` - Get daily report
- `POST /attendance/auto-checkout` - Run auto-checkout (scheduled)
- `POST /attendance/daily-reports/generate` - Generate daily reports (scheduled)

### Alerts
- `GET /alerts` - Get alerts with filters (security/management only)
- `GET /alerts/unresolved` - Get unresolved alerts (security/management only)
- `GET /alerts/:id` - Get alert details (security/management only)
- `PATCH /alerts/:id/resolve` - Resolve alert (security/management only)
- `POST /alerts/emergency/initiate` - Initiate emergency (security/management only)
- `POST /alerts/emergency/:eventId/end` - End emergency (security/management only)
- `GET /alerts/emergency/active` - Get active emergencies (security/management only)
- `GET /alerts/emergency/history` - Get emergency history (security/management only)

### Invites
- `POST /invites` - Create invite code (management only)
- `GET /invites` - List invite codes (management only)
- `GET /invites/unused` - Get unused codes (management only)
- `GET /invites/code/:code` - Get invite by code (management only)
- `GET /invites/:id` - Get invite by ID (management only)
- `DELETE /invites/:id` - Delete invite (management only)

### Health
- `GET /health` - Health check
- `GET /health/ready` - Readiness probe

## Database Schema

The system uses ~22 tables:

- **users** - User accounts with roles
- **students** - Student profiles
- **parents** - Parent profiles
- **teachers** - Teacher profiles
- **staff** - Staff profiles (security, management)
- **rooms** - Physical rooms
- **devices** - NFC readers
- **nfc_cards** - NFC card registrations
- **attendance_records** - Check-in/check-out records
- **schedules** - Class schedules
- **schedule_enrollments** - Student schedule enrollments
- **alerts** - System alerts
- **invite_codes** - Registration invites
- **device_logs** - Device operation logs
- **announcements** - System announcements
- **audit_logs** - Action audit trail
- **daily_reports** - Daily attendance reports
- **emergency_events** - Emergency event records
- **notifications** - User notifications
- **settings** - System settings

## Scheduled Tasks

- **Auto-checkout** (hourly): Automatically checks out students who have been in a room beyond the timeout
- **Daily reports** (daily at midnight): Generates attendance summaries for each room
- **Device heartbeat check** (every 5 minutes): Marks devices as offline if no heartbeat received

## Authentication & Authorization

### JWT Authentication
All protected endpoints require a JWT token in the `Authorization: Bearer <token>` header.

### Role-Based Access Control
Five roles with hierarchical permissions:
1. **student** - Can view own attendance
2. **parent** - Can view linked student attendance
3. **teacher** - Can view enrolled student attendance
4. **security_guard** - Can view all attendance and manage alerts
5. **management** - Full system access

### Device Authentication
NFC devices authenticate with base64-encoded credentials:
```
Authorization: Bearer base64(deviceId:secret)
```

## Error Handling

The API returns consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/endpoint",
  "details": {
    "field": "error details"
  }
}
```

## Logging

- Application logs are output to console
- Device operation logs are stored in the `device_logs` table
- User actions are logged in the `audit_logs` table for compliance

## Development

### Run tests
```bash
npm test
```

### Run tests with coverage
```bash
npm run test:cov
```

### Format code
```bash
npm run format
```

### Lint code
```bash
npm run lint
```

### Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

## Deployment

### Build for production
```bash
npm run build
```

### Run production server
```bash
npm run start:prod
```

## Docker

Build and run with Docker:

```bash
docker build -t kinneret-shield-backend .
docker run -p 3000:3000 --env-file .env kinneret-shield-backend
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens expire after 24 hours (configurable)
- Device authentication uses environment secrets
- Row-level security (RLS) policies should be enabled in Supabase
- All user actions are logged in audit_logs
- Rate limiting should be implemented at the reverse proxy level
- CORS is enabled only for configured origins
- Input validation is enforced on all endpoints

## License

PROPRIETARY - TanenbaumCHAT
