import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDeviceDto {
  @ApiProperty({ description: 'Device serial number' })
  @IsString()
  serialNumber: string;

  @ApiProperty({ description: 'Device firmware version' })
  @IsString()
  firmwareVersion: string;

  @ApiProperty({ description: 'Room ID where device is installed' })
  @IsUUID()
  roomId: string;

  @ApiProperty({ description: 'Device authentication secret' })
  @IsString()
  secret: string;
}
