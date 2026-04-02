import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  created_by: string;

  @ApiPropertyOptional()
  used_by?: string;

  @ApiProperty()
  expires_at: Date;

  @ApiPropertyOptional()
  used_at?: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  is_used: boolean;

  @ApiProperty()
  is_expired: boolean;
}
