import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { RoomOccupancyDto } from './dto/room-occupancy.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';

@Injectable()
export class RoomsService {
  private logger = new Logger(RoomsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateRoomDto): Promise<RoomResponseDto> {
    // Check for unique constraint on building/floor/room_number
    const existing = await this.prisma.room.findUnique({
      where: {
        building_floor_room_number: {
          building: createDto.building,
          floor: createDto.floor,
          room_number: createDto.room_number,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Room already exists at ${createDto.building}/${createDto.floor}/${createDto.room_number}`,
      );
    }

    const room = await this.prisma.room.create({
      data: createDto,
    });

    return this.mapToResponseDto(room);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<RoomResponseDto>> {
    const [items, total] = await Promise.all([
      this.prisma.room.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { building: 'asc' },
      }),
      this.prisma.room.count(),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((room) => this.mapToResponseDto(room)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  async findById(id: string): Promise<RoomResponseDto> {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return this.mapToResponseDto(room);
  }

  async update(id: string, updateDto: UpdateRoomDto): Promise<RoomResponseDto> {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    const updated = await this.prisma.room.update({
      where: { id },
      data: updateDto,
    });

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    await this.prisma.room.delete({
      where: { id },
    });
  }

  async findByBuilding(building: string, pagination: PaginationDto): Promise<PaginatedResponseDto<RoomResponseDto>> {
    const [items, total] = await Promise.all([
      this.prisma.room.findMany({
        where: { building },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { floor: 'asc' },
      }),
      this.prisma.room.count({
        where: { building },
      }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((room) => this.mapToResponseDto(room)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  async getOccupancy(roomId: string): Promise<RoomOccupancyDto> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Get current occupancy (students currently checked in)
    const checkedInCount = await this.prisma.attendanceRecord.count({
      where: {
        room_id: roomId,
        status: 'checked_in',
      },
    });

    const occupancyPercentage = (checkedInCount / room.capacity) * 100;
    const isAtCapacity = checkedInCount >= room.capacity;

    return {
      roomId: room.id,
      currentOccupancy: checkedInCount,
      capacity: room.capacity,
      occupancyPercentage: Math.round(occupancyPercentage * 100) / 100,
      isAtCapacity,
      timestamp: new Date(),
    };
  }

  async getAllOccupancies(): Promise<RoomOccupancyDto[]> {
    const rooms = await this.prisma.room.findMany();

    const occupancies = await Promise.all(
      rooms.map((room) => this.getOccupancy(room.id)),
    );

    return occupancies;
  }

  private mapToResponseDto(room: any): RoomResponseDto {
    return {
      id: room.id,
      name: room.name,
      building: room.building,
      floor: room.floor,
      room_number: room.room_number,
      type: room.type,
      capacity: room.capacity,
      created_at: room.created_at,
      updated_at: room.updated_at,
    };
  }
}
