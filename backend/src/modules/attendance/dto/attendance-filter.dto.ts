import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceFilterDto {
  @ApiPropertyOptional({ description: 'Filter by student ID' })
  @IsOptional()
  @IsString()
  student_id?: string;

  @ApiPropertyOptional({ description: 'Filter by room ID' })
  @IsOptional()
  @IsString()
  room_id?: string;

  @ApiPropertyOptional({ description: 'Filter by start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by attendance status' })
  @IsOptional()
  @IsString()
  status?: string;
}
