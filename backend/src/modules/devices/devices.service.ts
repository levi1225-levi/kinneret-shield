import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { DeviceHeartbeatDto } from './dto/device-heartbeat.dto';
import { DeviceResponseDto } from './dto/device-response.dto';
import { DeviceConfigDto } from './dto/device-config.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';
import { DeviceStatus } from '@prisma/client';

@Injectable()
export class DevicesService {
  private logger = new Logger(DevicesService.name);

  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDeviceDto): Promise<DeviceResponseDto> {
    const { serialNumber, firmwareVersion, roomId, secret } = registerDto;

    // Verify secret
    if (secret !== process.env.DEVICE_AUTH_SECRET) {
      throw new BadRequestException('Invalid device authentication secret');
    }

    // Check if device already registered
    const existing = await this.prisma.device.findUnique({
      where: { serial_number: serialNumber },
    });

    if (existing) {
      throw new ConflictException(`Device with serial number ${serialNumber} already registered`);
    }

    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new BadRequestException(`Room with ID ${roomId} not found`);
    }

    const device = await this.prisma.device.create({
      data: {
        serial_number: serialNumber,
        firmware_version: firmwareVersion,
        room_id: roomId,
        status: DeviceStatus.online,
        last_heartbeat: new Date(),
      },
    });

    return this.mapToResponseDto(device);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<DeviceResponseDto>> {
    const [items, total] = await Promise.all([
      this.prisma.device.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.device.count(),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((device) => this.mapToResponseDto(device)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  async findById(id: string): Promise<DeviceResponseDto> {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    return this.mapToResponseDto(device);
  }

  async findByRoom(roomId: string): Promise<DeviceResponseDto[]> {
    const devices = await this.prisma.device.findMany({
      where: { room_id: roomId },
    });

    return devices.map((device) => this.mapToResponseDto(device));
  }

  async heartbeat(deviceId: string, heartbeatDto: DeviceHeartbeatDto): Promise<DeviceResponseDto> {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    const updated = await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        last_heartbeat: new Date(),
        firmware_version: heartbeatDto.firmwareVersion,
        status: DeviceStatus.online,
      },
    });

    // Log device status
    await this.prisma.deviceLog.create({
      data: {
        device_id: deviceId,
        level: 'info',
        message: 'Heartbeat received',
        data: heartbeatDto.status || {},
      },
    });

    return this.mapToResponseDto(updated);
  }

  async updateConfig(id: string, configDto: DeviceConfigDto): Promise<DeviceResponseDto> {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    const updated = await this.prisma.device.update({
      where: { id },
      data: {
        config: configDto.config || {},
      },
    });

    return this.mapToResponseDto(updated);
  }

  async setStatus(id: string, status: DeviceStatus): Promise<DeviceResponseDto> {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    const updated = await this.prisma.device.update({
      where: { id },
      data: { status },
    });

    // Create alert if going offline
    if (status === DeviceStatus.offline && device.status !== DeviceStatus.offline) {
      await this.prisma.alert.create({
        data: {
          type: 'device_offline',
          severity: 'high',
          device_id: id,
          message: `Device ${device.serial_number} went offline`,
        },
      });
    }

    return this.mapToResponseDto(updated);
  }

  async checkOfflineDevices(): Promise<void> {
    const heartbeatTimeout = parseInt(process.env.DEVICE_HEARTBEAT_TIMEOUT || '120000', 10);
    const cutoffTime = new Date(Date.now() - heartbeatTimeout);

    const offlineDevices = await this.prisma.device.findMany({
      where: {
        status: { not: DeviceStatus.offline },
        last_heartbeat: {
          lt: cutoffTime,
        },
      },
    });

    for (const device of offlineDevices) {
      await this.setStatus(device.id, DeviceStatus.offline);
      this.logger.warn(`Device ${device.serial_number} marked as offline due to missed heartbeat`);
    }
  }

  private mapToResponseDto(device: any): DeviceResponseDto {
    return {
      id: device.id,
      room_id: device.room_id,
      serial_number: device.serial_number,
      firmware_version: device.firmware_version,
      status: device.status,
      last_heartbeat: device.last_heartbeat,
      config: device.config,
      created_at: device.created_at,
      updated_at: device.updated_at,
    };
  }
}
