import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceScheduler } from './attendance.scheduler';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceScheduler, PrismaService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
