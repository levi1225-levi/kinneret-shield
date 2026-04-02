import { Controller, Get, Post, Body, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { RoomOccupancyDto } from './dto/room-occupancy.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.management)
  @ApiOperation({ summary: 'Create new room' })
  @ApiResponse({ status: 201, type: RoomResponseDto })
  create(@Body() createDto: CreateRoomDto): Promise<RoomResponseDto> {
    return this.roomsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all rooms' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<RoomResponseDto>> {
    return this.roomsService.findAll(pagination);
  }

  @Get('building/:building')
  @ApiOperation({ summary: 'Get rooms by building' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  findByBuilding(
    @Param('building') building: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<RoomResponseDto>> {
    return this.roomsService.findByBuilding(building, pagination);
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Get all room occupancies' })
  @ApiResponse({ status: 200, type: [RoomOccupancyDto] })
  getAllOccupancies(): Promise<RoomOccupancyDto[]> {
    return this.roomsService.getAllOccupancies();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiResponse({ status: 200, type: RoomResponseDto })
  findById(@Param('id') id: string): Promise<RoomResponseDto> {
    return this.roomsService.findById(id);
  }

  @Get(':id/occupancy')
  @ApiOperation({ summary: 'Get room occupancy' })
  @ApiResponse({ status: 200, type: RoomOccupancyDto })
  getOccupancy(@Param('id') id: string): Promise<RoomOccupancyDto> {
    return this.roomsService.getOccupancy(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.management)
  @ApiOperation({ summary: 'Update room' })
  @ApiResponse({ status: 200, type: RoomResponseDto })
  update(@Param('id') id: string, @Body() updateDto: UpdateRoomDto): Promise<RoomResponseDto> {
    return this.roomsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.management)
  @ApiOperation({ summary: 'Delete room' })
  @ApiResponse({ status: 204 })
  delete(@Param('id') id: string): Promise<void> {
    return this.roomsService.delete(id);
  }
}
