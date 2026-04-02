import { Controller, Get, Post, Body, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.management)
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.usersService.findAll(pagination);
  }

  @Get('search')
  @Roles(UserRole.management)
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  search(
    @Query('q') query: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.usersService.searchUsers(query, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateDto, user.sub);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.management)
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  deactivate(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.deactivateUser(id);
  }

  @Post(':id/activate')
  @Roles(UserRole.management)
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  activate(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.activateUser(id);
  }
}
