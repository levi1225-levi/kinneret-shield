import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InviteResponseDto } from './dto/invite-response.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('invites')
@Controller('invites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.management)
@ApiBearerAuth()
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new invite code' })
  @ApiResponse({ status: 201, type: InviteResponseDto })
  create(
    @Body() createDto: CreateInviteDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<InviteResponseDto> {
    return this.invitesService.create(createDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List all invite codes' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<InviteResponseDto>> {
    return this.invitesService.findAll(pagination);
  }

  @Get('unused')
  @ApiOperation({ summary: 'Get unused and valid invite codes' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  getUnused(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<InviteResponseDto>> {
    return this.invitesService.getUnusedInvites(pagination);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get invite by code' })
  @ApiResponse({ status: 200, type: InviteResponseDto })
  findByCode(@Param('code') code: string): Promise<InviteResponseDto> {
    return this.invitesService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invite by ID' })
  @ApiResponse({ status: 200, type: InviteResponseDto })
  findById(@Param('id') id: string): Promise<InviteResponseDto> {
    return this.invitesService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invite code' })
  @ApiResponse({ status: 204 })
  delete(@Param('id') id: string): Promise<void> {
    return this.invitesService.delete(id);
  }
}
