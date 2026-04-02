import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { NfcTapDto, NfcTapResponseDto } from './dto/nfc-tap.dto';
import { AttendanceResponseDto } from './dto/attendance-response.dto';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { DailyReportDto } from './dto/daily-report.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  private logger = new Logger(AttendanceService.name);

  constructor(private prisma: PrismaService) {}

  async processTap(deviceId: string, tapDto: NfcTapDto): Promise<NfcTapResponseDto> {
    const { cardUid } = tapDto;

    // Find or create NFC card
    let nfcCard = await this.prisma.nfcCard.findUnique({
      where: { uid: cardUid },
    });

    if (!nfcCard) {
      // Unknown card - create alert
      const device = await this.prisma.device.findUnique({
        where: { id: deviceId },
      });

      await this.prisma.alert.create({
        data: {
          type: 'unknown_card',
          severity: 'medium',
          device_id: deviceId,
          message: `Unknown NFC card scanned: ${cardUid}`,
          data: { cardUid },
        },
      });

      return {
        success: false,
        message: 'Unknown card',
      };
    }

    if (!nfcCard.is_active || !nfcCard.user_id) {
      return {
        success: false,
        message: 'Card is not active or not associated with a user',
      };
    }

    // Get student
    const student = await this.prisma.student.findUnique({
      where: { user_id: nfcCard.user_id },
    });

    if (!student) {
      return {
        success: false,
        message: 'Card user is not a student',
      };
    }

    // Get device and room info
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      include: { room: true },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Check current attendance status
    const lastRecord = await this.prisma.attendanceRecord.findFirst({
      where: {
        student_id: student.id,
        room_id: device.room_id,
        status: AttendanceStatus.checked_in,
      },
      orderBy: { check_in_at: 'desc' },
    });

    let response: NfcTapResponseDto;

    if (lastRecord) {
      // Check out
      await this.prisma.attendanceRecord.update({
        where: { id: lastRecord.id },
        data: {
          check_out_at: new Date(),
          status: AttendanceStatus.checked_out,
        },
      });

      response = {
        success: true,
        message: 'Checked out successfully',
        studentId: student.id,
        studentName: (await this.prisma.user.findUnique({ where: { id: student.user_id } }))?.name,
        action: 'check_out',
        timestamp: new Date(),
      };
    } else {
      // Check in
      // Verify capacity
      const currentOccupancy = await this.prisma.attendanceRecord.count({
        where: {
          room_id: device.room_id,
          status: AttendanceStatus.checked_in,
        },
      });

      if (currentOccupancy >= device.room.capacity) {
        await this.prisma.alert.create({
          data: {
            type: 'capacity_exceeded',
            severity: 'high',
            room_id: device.room_id,
            device_id: deviceId,
            message: `Room ${device.room.name} is at capacity`,
          },
        });

        return {
          success: false,
          message: 'Room is at capacity',
        };
      }

      const record = await this.prisma.attendanceRecord.create({
        data: {
          student_id: student.id,
          room_id: device.room_id,
          device_id: deviceId,
          nfc_card_id: nfcCard.id,
          check_in_at: new Date(),
          status: AttendanceStatus.checked_in,
        },
      });

      response = {
        success: true,
        message: 'Checked in successfully',
        studentId: student.id,
        studentName: (await this.prisma.user.findUnique({ where: { id: student.user_id } }))?.name,
        action: 'check_in',
        timestamp: record.check_in_at,
      };
    }

    return response;
  }

  async getAttendanceHistory(
    filters: AttendanceFilterDto,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<AttendanceResponseDto>> {
    const where: any = {};

    if (filters.student_id) {
      where.student_id = filters.student_id;
    }
    if (filters.room_id) {
      where.room_id = filters.room_id;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.startDate || filters.endDate) {
      where.check_in_at = {};
      if (filters.startDate) {
        where.check_in_at.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.check_in_at.lte = new Date(filters.endDate);
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { check_in_at: 'desc' },
      }),
      this.prisma.attendanceRecord.count({ where }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((record) => this.mapToResponseDto(record)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  async getStudentAttendance(
    studentId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<AttendanceResponseDto>> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const [items, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where: { student_id: studentId },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { check_in_at: 'desc' },
      }),
      this.prisma.attendanceRecord.count({ where: { student_id: studentId } }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((record) => this.mapToResponseDto(record)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  async getRoomAttendance(
    roomId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<AttendanceResponseDto>> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    const [items, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where: { room_id: roomId },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { check_in_at: 'desc' },
      }),
      this.prisma.attendanceRecord.count({ where: { room_id: roomId } }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((record) => this.mapToResponseDto(record)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  async autoCheckout(): Promise<number> {
    const autoCheckoutTimeout = parseInt(
      process.env.AUTO_CHECKOUT_TIMEOUT || '3600000',
      10,
    );
    const cutoffTime = new Date(Date.now() - autoCheckoutTimeout);

    const checkedInRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        status: AttendanceStatus.checked_in,
        check_in_at: {
          lt: cutoffTime,
        },
      },
    });

    let count = 0;
    for (const record of checkedInRecords) {
      await this.prisma.attendanceRecord.update({
        where: { id: record.id },
        data: {
          check_out_at: cutoffTime,
          status: AttendanceStatus.auto_checked_out,
        },
      });
      count++;
    }

    this.logger.log(`Auto-checked out ${count} records`);
    return count;
  }

  async generateDailyReports(): Promise<DailyReportDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const rooms = await this.prisma.room.findMany();
    const reports: DailyReportDto[] = [];

    for (const room of rooms) {
      const records = await this.prisma.attendanceRecord.findMany({
        where: {
          room_id: room.id,
          check_in_at: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      const uniqueStudents = new Set(records.map((r) => r.student_id));

      let totalDurationMinutes = 0;
      for (const record of records) {
        if (record.check_out_at) {
          const duration =
            (record.check_out_at.getTime() - record.check_in_at.getTime()) /
            60000;
          totalDurationMinutes += duration;
        }
      }

      const avgDurationMinutes =
        records.length > 0 ? totalDurationMinutes / records.length : 0;

      const report = await this.prisma.dailyReport.upsert({
        where: {
          date_room_id: {
            date: today,
            room_id: room.id,
          },
        },
        create: {
          date: today,
          room_id: room.id,
          total_check_ins: records.length,
          unique_students: uniqueStudents.size,
          avg_duration_minutes: avgDurationMinutes,
          anomalies: [],
        },
        update: {
          total_check_ins: records.length,
          unique_students: uniqueStudents.size,
          avg_duration_minutes: avgDurationMinutes,
        },
      });

      reports.push(this.mapReportToDto(report));
    }

    return reports;
  }

  async getDailyReport(roomId: string, date: Date): Promise<DailyReportDto> {
    date.setHours(0, 0, 0, 0);

    const report = await this.prisma.dailyReport.findUnique({
      where: {
        date_room_id: {
          date,
          room_id: roomId,
        },
      },
    });

    if (!report) {
      throw new NotFoundException(
        `No report found for room ${roomId} on ${date.toDateString()}`,
      );
    }

    return this.mapReportToDto(report);
  }

  private mapToResponseDto(record: any): AttendanceResponseDto {
    let duration_minutes: number | undefined;
    if (record.check_out_at) {
      duration_minutes =
        (record.check_out_at.getTime() - record.check_in_at.getTime()) / 60000;
    }

    return {
      id: record.id,
      student_id: record.student_id,
      room_id: record.room_id,
      device_id: record.device_id,
      nfc_card_id: record.nfc_card_id,
      check_in_at: record.check_in_at,
      check_out_at: record.check_out_at,
      status: record.status,
      duration_minutes,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  private mapReportToDto(report: any): DailyReportDto {
    return {
      id: report.id,
      date: report.date,
      room_id: report.room_id,
      total_check_ins: report.total_check_ins,
      unique_students: report.unique_students,
      avg_duration_minutes: report.avg_duration_minutes,
      anomalies: report.anomalies,
      created_at: report.created_at,
    };
  }
}
