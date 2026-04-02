import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { DeviceHeartbeatDto } from './dto/device-heartbeat.dto';
import { DeviceResponseDto } from './dto/device-response.dto';
import { DeviceConfigDto } from './dto/device-config.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { DeviceAuthGuard } from '@/common/guards/device-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register NFC device' })
  @ApiResponse({ status: 201, type: DeviceResponseDto })
  register(@Body() registerDto: RegisterDeviceDto): Promise<DeviceResponseDto> {
    return this.devicesService.register(registerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all devices' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<DeviceResponseDto>> {
    return this.devicesService.findAll(pagination);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get device by ID' })
  @ApiResponse({ status: 200, type: DeviceResponseDto })
  findById(@Param('id') id: string): Promise<DeviceResponseDto> {
    return this.devicesService.findById(id);
  }

  @Get('room/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get devices in room' })
  @ApiResponse({ status: 200, type: [DeviceResponseDto] })
  findByRoom(@Param('roomId') roomId: string): Promise<DeviceResponseDto[]> {
    return this.devicesService.findByRoom(roomId);
  }

  @Post(':id/heartbeat')
  @UseGuards(DeviceAuthGuard)
  @ApiOperation({ summary: 'Device heartbeat (device endpoint)' })
  @ApiResponse({ status: 200, type: DeviceResponseDto })
  heartbeat(
    @Param('id') id: string,
    @Body() heartbeatDto: DeviceHeartbeatDto,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.heartbeat(id, heartbeatDto);
  }

  @Patch(':id/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.management)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update device configuration' })
  @ApiResponse({ status: 200, type: DeviceResponseDto })
  updateConfig(
    @Param('id') id: string,
    @Body() configDto: DeviceConfigDto,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.updateConfig(id, configDto);
  }
}
