import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  student_id: string;

  @ApiProperty()
  room_id: string;

  @ApiProperty()
  device_id: string;

  @ApiProperty()
  nfc_card_id: string;

  @ApiProperty()
  check_in_at: Date;

  @ApiPropertyOptional()
  check_out_at?: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  duration_minutes?: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
