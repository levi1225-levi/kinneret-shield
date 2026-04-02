import { ApiProperty } from '@nestjs/swagger';

export class DailyReportDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  room_id: string;

  @ApiProperty()
  total_check_ins: number;

  @ApiProperty()
  unique_students: number;

  @ApiProperty()
  avg_duration_minutes: number;

  @ApiProperty()
  anomalies: any[];

  @ApiProperty()
  created_at: Date;
}
