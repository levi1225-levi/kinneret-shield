# Kinneret Shield Backend - Setup Guide

Complete instructions for setting up and deploying the Kinneret Shield backend system.

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google OAuth 2.0 credentials (optional, for initial testing)

### 2. Clone and Install
```bash
cd kinneret-shield/backend
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kinneret_shield

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-long-random-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Device Auth
DEVICE_AUTH_SECRET=your-device-secret-key
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Create/migrate database
npm run prisma:migrate dev --name init

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 5. Start Development Server
```bash
npm run start:dev
```

Access at:
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health

## Docker Deployment

### Using Docker Compose (Local)
```bash
# Create .env file with your configuration
cp .env.example .env

# Start services
docker-compose up

# Run migrations
docker-compose exec backend npm run prisma:migrate dev --name init
```

### Production Docker Build
```bash
# Build image
docker build -t kinneret-shield-backend:latest .

# Run container
docker run -p 3000:3000 \
  --env-file .env \
  kinneret-shield-backend:latest
```

## Supabase Setup

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Get connection string and keys from Settings > Database

### 2. Enable Row-Level Security (RLS)
```sql
-- Run in Supabase SQL Editor
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceRecord" ENABLE ROW LEVEL SECURITY;
-- ... enable for all tables
```

### 3. Create RLS Policies
Example policy for students to see their own attendance:
```sql
CREATE POLICY "Students see own attendance"
  ON "AttendanceRecord"
  FOR SELECT
  USING (auth.uid() = student_id);
```

## Google OAuth Setup

### 1. Create OAuth Credentials
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - http://localhost:3000/auth/google/callback
   - https://yourdomain.com/auth/google/callback (production)

### 2. Update .env
```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## Initial Data Setup

### Create Test Data
```bash
# Generate invite codes
curl -X POST http://localhost:3000/invites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"student"}'
```

### Create Rooms
```bash
curl -X POST http://localhost:3000/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Room 101",
    "building": "Main",
    "floor": 1,
    "room_number": "101",
    "type": "classroom",
    "capacity": 30
  }'
```

### Register Device
```bash
curl -X POST http://localhost:3000/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "DEVICE001",
    "firmwareVersion": "1.0.0",
    "roomId": "room-uuid",
    "secret": "your-device-secret"
  }'
```

## Production Deployment

### Using Railway/Render/Heroku

#### 1. Build and Deploy
```bash
# Push to git repository
git push origin main
```

#### 2. Environment Variables
Set these in your deployment platform:
- All `.env` variables
- DATABASE_URL (provided by platform)
- NODE_ENV=production

#### 3. Database Migration
```bash
# Run migrations on deployment
npm run prisma:migrate deploy
```

### Using Kubernetes

#### 1. Create ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kinneret-config
data:
  NODE_ENV: production
  PORT: "3000"
  CORS_ORIGIN: https://yourdomain.com
```

#### 2. Create Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: kinneret-secrets
type: Opaque
stringData:
  DATABASE_URL: postgresql://...
  JWT_SECRET: ...
  DEVICE_AUTH_SECRET: ...
```

#### 3. Deploy
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kinneret-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kinneret-backend
  template:
    metadata:
      labels:
        app: kinneret-backend
    spec:
      containers:
      - name: backend
        image: your-registry/kinneret-shield-backend:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: kinneret-config
        - secretRef:
            name: kinneret-secrets
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Monitoring

### Health Checks
```bash
# Service health
curl http://localhost:3000/health

# Readiness for load balancer
curl http://localhost:3000/health/ready
```

### Logs
```bash
# Development
npm run start:dev  # logs to console

# Docker
docker logs -f kinneret_backend

# Kubernetes
kubectl logs -f deployment/kinneret-backend
```

### Database Monitoring
```bash
# Prisma Studio (visualize data)
npm run prisma:studio

# Check database connections
npx prisma studio
```

## Troubleshooting

### Database Connection Error
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Migration Issues
```bash
# Reset database (⚠️ deletes all data)
npm run prisma:migrate reset

# View migration status
npx prisma migrate status

# Create new migration
npm run prisma:migrate dev --name your_migration_name
```

### Device Registration Failure
- Verify DEVICE_AUTH_SECRET matches device configuration
- Check device has network connectivity
- Check device serial number is unique

### Authentication Issues
- Verify JWT_SECRET is set (24+ characters recommended)
- Check Google OAuth credentials are correct
- Verify callback URLs match configuration

## Performance Optimization

### Database Indexing
Indexes are automatically created by Prisma for:
- Primary keys
- Foreign keys
- Fields marked with `@index`

Monitor slow queries:
```sql
SELECT query, mean_time FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;
```

### Caching
Add Redis for:
- Session caching
- Attendance lookup cache
- Device status cache

### Rate Limiting
Implement at reverse proxy level (Nginx, CloudFlare):
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

## Security Checklist

- [ ] Change all default secrets and keys
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Enable database encryption
- [ ] Set up audit logging
- [ ] Configure backup strategy
- [ ] Implement rate limiting
- [ ] Enable database RLS policies
- [ ] Use environment-specific configs
- [ ] Regular security updates

## Support

For issues or questions:
1. Check the README.md
2. Review environment configuration
3. Check application logs
4. Verify database connectivity
5. Test endpoints with Swagger UI
