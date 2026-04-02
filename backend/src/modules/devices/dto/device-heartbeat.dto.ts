import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeviceHeartbeatDto {
  @ApiProperty({ description: 'Device ID' })
  @IsString()
  deviceId: string;

  @ApiProperty({ description: 'Current firmware version' })
  @IsString()
  firmwareVersion: string;

  @ApiPropertyOptional({ description: 'Device status/health data' })
  @IsOptional()
  @IsObject()
  status?: Record<string, any>;
}
