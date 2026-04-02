import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AlertResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  severity: string;

  @ApiPropertyOptional()
  room_id?: string;

  @ApiPropertyOptional()
  device_id?: string;

  @ApiPropertyOptional()
  user_id?: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: Record<string, any>;

  @ApiProperty()
  resolved: boolean;

  @ApiPropertyOptional()
  resolved_by?: string;

  @ApiPropertyOptional()
  resolved_at?: Date;

  @ApiProperty()
  created_at: Date;
}
