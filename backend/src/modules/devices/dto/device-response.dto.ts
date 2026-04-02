import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeviceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  room_id: string;

  @ApiProperty()
  serial_number: string;

  @ApiProperty()
  firmware_version: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  last_heartbeat?: Date;

  @ApiPropertyOptional()
  config?: Record<string, any>;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
