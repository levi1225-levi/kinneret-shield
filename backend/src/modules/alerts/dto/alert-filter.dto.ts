import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AlertFilterDto {
  @ApiPropertyOptional({ description: 'Filter by alert type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by severity' })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ description: 'Filter by room ID' })
  @IsOptional()
  @IsString()
  room_id?: string;

  @ApiPropertyOptional({ description: 'Filter by device ID' })
  @IsOptional()
  @IsString()
  device_id?: string;

  @ApiPropertyOptional({ description: 'Filter by resolved status' })
  @IsOptional()
  @IsBoolean()
  resolved?: boolean;
}
