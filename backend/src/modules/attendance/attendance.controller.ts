import { Controller, Post, Get, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { NfcTapDto, NfcTapResponseDto } from './dto/nfc-tap.dto';
import { AttendanceResponseDto } from './dto/attendance-response.dto';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { DailyReportDto } from './dto/daily-report.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { DeviceAuthGuard } from '@/common/guards/device-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { DeviceAuth, AuthenticatedDevice } from '@/common/decorators/device-auth.decorator';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('tap/:deviceId')
  @UseGuards(DeviceAuthGuard)
  @ApiOperation({ summary: 'Process NFC tap from device' })
  @ApiResponse({ status: 200, type: NfcTapResponseDto })
  processTap(
    @Param('deviceId') deviceId: string,
    @Body() tapDto: NfcTapDto,
  ): Promise<NfcTapResponseDto> {
    return this.attendanceService.processTap(deviceId, tapDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher, UserRole.security_guard, UserRole.management)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance records with filters' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  getAttendance(
    @Query() filters: AttendanceFilterDto,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<AttendanceResponseDto>> {
    return this.attendanceService.getAttendanceHistory(filters, pagination);
  }

  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance for a student' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  getStudentAttendance(
    @Param('studentId') studentId: string,
    @Query() pagination: PaginationDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaginatedResponseDto<AttendanceResponseDto>> {
    return this.attendanceService.getStudentAttendance(studentId, pagination);
  }

  @Get('room/:roomId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher, UserRole.security_guard, UserRole.management)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance for a room' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  getRoomAttendance(
    @Param('roomId') roomId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<AttendanceResponseDto>> {
    return this.attendanceService.getRoomAttendance(roomId, pagination);
  }

  @Post('auto-checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.management)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Auto-checkout students (scheduled task)' })
  @ApiResponse({ status: 200 })
  autoCheckout(): Promise<number> {
    return this.attendanceService.autoCheckout();
  }

  @Post('daily-reports/generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.management)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate daily reports (scheduled task)' })
  @ApiResponse({ status: 200, type: [DailyReportDto] })
  generateDailyReports(): Promise<DailyReportDto[]> {
    return this.attendanceService.generateDailyReports();
  }

  @Get('daily-report/:roomId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher, UserRole.security_guard, UserRole.management)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get daily report for a room' })
  @ApiResponse({ status: 200, type: DailyReportDto })
  getDailyReport(
    @Param('roomId') roomId: string,
    @Query('date') date: string,
  ): Promise<DailyReportDto> {
    return this.attendanceService.getDailyReport(roomId, new Date(date));
  }
}
