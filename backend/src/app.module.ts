import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/app.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { DevicesModule } from './modules/devices/devices.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { InvitesModule } from './modules/invites/invites.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    RoomsModule,
    DevicesModule,
    AttendanceModule,
    AlertsModule,
    InvitesModule,
    HealthModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
