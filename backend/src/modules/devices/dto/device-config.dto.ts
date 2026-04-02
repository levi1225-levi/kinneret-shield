import { IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeviceConfigDto {
  @ApiPropertyOptional({ description: 'Device configuration JSON' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
