import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((user) => this.mapToResponseDto(user)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return this.mapToResponseDto(user);
  }

  async update(id: string, updateDto: UpdateUserDto, currentUserId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Users can only update their own profile unless they're management
    if (id !== currentUserId) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
      });

      if (currentUser.role !== 'management') {
        throw new ForbiddenException('You can only update your own profile');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateDto,
    });

    return this.mapToResponseDto(updated);
  }

  async deactivateUser(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { is_active: false },
    });

    return this.mapToResponseDto(updated);
  }

  async activateUser(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { is_active: true },
    });

    return this.mapToResponseDto(updated);
  }

  async searchUsers(query: string, pagination: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.user.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((user) => this.mapToResponseDto(user)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  private mapToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
