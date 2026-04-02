import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AlertResponseDto } from './dto/alert-response.dto';
import { AlertFilterDto } from './dto/alert-filter.dto';
import { CreateEmergencyEventDto, EmergencyEventResponseDto } from './dto/emergency-event.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';

@Injectable()
export class AlertsService {
  private logger = new Logger(AlertsService.name);

  constructor(private prisma: PrismaService) {}

  async getAlerts(
    filters: AlertFilterDto,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<AlertResponseDto>> {
    const where: any = {};

    if (filters.type) where.type = filters.type;
    if (filters.severity) where.severity = filters.severity;
    if (filters.room_id) where.room_id = filters.room_id;
    if (filters.device_id) where.device_id = filters.device_id;
    if (filters.resolved !== undefined) where.resolved = filters.resolved;

    const [items, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.alert.count({ where }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((alert) => this.mapToResponseDto(alert)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  async getAlertById(id: string): Promise<AlertResponseDto> {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    return this.mapToResponseDto(alert);
  }

  async resolveAlert(id: string, userId: string): Promise<AlertResponseDto> {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    const updated = await this.prisma.alert.update({
      where: { id },
      data: {
        resolved: true,
        resolved_by: userId,
        resolved_at: new Date(),
      },
    });

    return this.mapToResponseDto(updated);
  }

  async getUnresolvedAlerts(pagination: PaginationDto): Promise<PaginatedResponseDto<AlertResponseDto>> {
    const [items, total] = await Promise.all([
      this.prisma.alert.findMany({
        where: { resolved: false },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ severity: 'desc' }, { created_at: 'desc' }],
      }),
      this.prisma.alert.count({ where: { resolved: false } }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((alert) => this.mapToResponseDto(alert)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  async initiateEmergency(userId: string, eventDto: CreateEmergencyEventDto): Promise<EmergencyEventResponseDto> {
    const event = await this.prisma.emergencyEvent.create({
      data: {
        type: eventDto.type,
        message: eventDto.message,
        initiated_by: userId,
        active: true,
      },
    });

    // Create critical alert
    await this.prisma.alert.create({
      data: {
        type: 'emergency',
        severity: 'critical',
        message: `Emergency: ${eventDto.message}`,
        data: { eventId: event.id, eventType: eventDto.type },
      },
    });

    this.logger.warn(`Emergency event initiated: ${eventDto.type} - ${eventDto.message}`);

    return this.mapEventToResponseDto(event);
  }

  async endEmergency(eventId: string): Promise<EmergencyEventResponseDto> {
    const event = await this.prisma.emergencyEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Emergency event with ID ${eventId} not found`);
    }

    const updated = await this.prisma.emergencyEvent.update({
      where: { id: eventId },
      data: {
        active: false,
        ended_at: new Date(),
      },
    });

    // Create all-clear alert
    await this.prisma.alert.create({
      data: {
        type: 'emergency',
        severity: 'high',
        message: `All clear: ${event.message}`,
        data: { eventId: event.id },
      },
    });

    this.logger.log(`Emergency event ended: ${event.type}`);

    return this.mapEventToResponseDto(updated);
  }

  async getActiveEmergencies(): Promise<EmergencyEventResponseDto[]> {
    const events = await this.prisma.emergencyEvent.findMany({
      where: { active: true },
      orderBy: { started_at: 'desc' },
    });

    return events.map((event) => this.mapEventToResponseDto(event));
  }

  async getEmergencyHistory(pagination: PaginationDto): Promise<PaginatedResponseDto<EmergencyEventResponseDto>> {
    const [items, total] = await Promise.all([
      this.prisma.emergencyEvent.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { started_at: 'desc' },
      }),
      this.prisma.emergencyEvent.count(),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((event) => this.mapEventToResponseDto(event)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  private mapToResponseDto(alert: any): AlertResponseDto {
    return {
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      room_id: alert.room_id,
      device_id: alert.device_id,
      user_id: alert.user_id,
      message: alert.message,
      data: alert.data,
      resolved: alert.resolved,
      resolved_by: alert.resolved_by,
      resolved_at: alert.resolved_at,
      created_at: alert.created_at,
    };
  }

  private mapEventToResponseDto(event: any): EmergencyEventResponseDto {
    return {
      id: event.id,
      type: event.type,
      initiated_by: event.initiated_by,
      message: event.message,
      active: event.active,
      started_at: event.started_at,
      ended_at: event.ended_at,
      created_at: event.created_at,
    };
  }
}
