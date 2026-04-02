import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { AlertResponseDto } from './dto/alert-response.dto';
import { AlertFilterDto } from './dto/alert-filter.dto';
import { CreateEmergencyEventDto, EmergencyEventResponseDto } from './dto/emergency-event.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.security_guard, UserRole.management)
  @ApiOperation({ summary: 'Get alerts with filters' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  getAlerts(
    @Query() filters: AlertFilterDto,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<AlertResponseDto>> {
    return this.alertsService.getAlerts(filters, pagination);
  }

  @Get('unresolved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.security_guard, UserRole.management)
  @ApiOperation({ summary: 'Get unresolved alerts' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  getUnresolved(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<AlertResponseDto>> {
    return this.alertsService.getUnresolvedAlerts(pagination);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.security_guard, UserRole.management)
  @ApiOperation({ summary: 'Get alert by ID' })
  @ApiResponse({ status: 200, type: AlertResponseDto })
  getAlertById(@Param('id') id: string): Promise<AlertResponseDto> {
    return this.alertsService.getAlertById(id);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.security_guard, UserRole.management)
  @ApiOperation({ summary: 'Resolve an alert' })
  @ApiResponse({ status: 200, type: AlertResponseDto })
  resolveAlert(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<AlertResponseDto> {
    return this.alertsService.resolveAlert(id, user.sub);
  }

  @Post('emergency/initiate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.security_guard, UserRole.management)
  @ApiOperation({ summary: 'Initiate emergency event' })
  @ApiResponse({ status: 201, type: EmergencyEventResponseDto })
  initiateEmergency(
    @Body() eventDto: CreateEmergencyEventDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<EmergencyEventResponseDto> {
    return this.alertsService.initiateEmergency(user.sub, eventDto);
  }

  @Post('emergency/:eventId/end')
  @UseGuards(RolesGuard)
  @Roles(UserRole.security_guard, UserRole.management)
  @ApiOperation({ summary: 'End emergency event' })
  @ApiResponse({ status: 200, type: EmergencyEventResponseDto })
  endEmergency(@Param('eventId') eventId: string): Promise<EmergencyEventResponseDto> {
    return this.alertsService.endEmergency(eventId);
  }

  @Get('emergency/active')
  @UseGuards(RolesGuard)
  @Roles(UserRole.security_guard, UserRole.management)
  @ApiOperation({ summary: 'Get active emergency events' })
  @ApiResponse({ status: 200, type: [EmergencyEventResponseDto] })
  getActiveEmergencies(): Promise<EmergencyEventResponseDto[]> {
    return this.alertsService.getActiveEmergencies();
  }

  @Get('emergency/history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.security_guard, UserRole.management)
  @ApiOperation({ summary: 'Get emergency event history' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  getEmergencyHistory(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<EmergencyEventResponseDto>> {
    return this.alertsService.getEmergencyHistory(pagination);
  }
}
