import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InviteResponseDto } from './dto/invite-response.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/api-response.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitesService {
  private logger = new Logger(InvitesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateInviteDto, userId: string): Promise<InviteResponseDto> {
    const code = this.generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days validity

    const invite = await this.prisma.inviteCode.create({
      data: {
        code,
        role: createDto.role,
        created_by: userId,
        expires_at: expiresAt,
      },
    });

    return this.mapToResponseDto(invite);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<InviteResponseDto>> {
    const [items, total] = await Promise.all([
      this.prisma.inviteCode.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inviteCode.count(),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((invite) => this.mapToResponseDto(invite)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  async findById(id: string): Promise<InviteResponseDto> {
    const invite = await this.prisma.inviteCode.findUnique({
      where: { id },
    });

    if (!invite) {
      throw new NotFoundException(`Invite with ID ${id} not found`);
    }

    return this.mapToResponseDto(invite);
  }

  async findByCode(code: string): Promise<InviteResponseDto> {
    const invite = await this.prisma.inviteCode.findUnique({
      where: { code },
    });

    if (!invite) {
      throw new NotFoundException(`Invite with code ${code} not found`);
    }

    return this.mapToResponseDto(invite);
  }

  async delete(id: string): Promise<void> {
    const invite = await this.prisma.inviteCode.findUnique({
      where: { id },
    });

    if (!invite) {
      throw new NotFoundException(`Invite with ID ${id} not found`);
    }

    await this.prisma.inviteCode.delete({
      where: { id },
    });
  }

  async getUnusedInvites(pagination: PaginationDto): Promise<PaginatedResponseDto<InviteResponseDto>> {
    const now = new Date();

    const [items, total] = await Promise.all([
      this.prisma.inviteCode.findMany({
        where: {
          used_by: null,
          expires_at: {
            gt: now,
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inviteCode.count({
        where: {
          used_by: null,
          expires_at: {
            gt: now,
          },
        },
      }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      items: items.map((invite) => this.mapToResponseDto(invite)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages,
    };
  }

  private generateInviteCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  private mapToResponseDto(invite: any): InviteResponseDto {
    const now = new Date();
    const isUsed = invite.used_by !== null;
    const isExpired = now > invite.expires_at;

    return {
      id: invite.id,
      code: invite.code,
      role: invite.role,
      created_by: invite.created_by,
      used_by: invite.used_by,
      expires_at: invite.expires_at,
      used_at: invite.used_at,
      created_at: invite.created_at,
      is_used: isUsed,
      is_expired: isExpired,
    };
  }
}
