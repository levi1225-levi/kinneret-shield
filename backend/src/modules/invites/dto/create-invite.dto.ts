import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateInviteDto {
  @ApiProperty({ enum: UserRole, description: 'Role for invited user' })
  @IsEnum(UserRole)
  role: UserRole;
}
