import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EmergencyEventTypeEnum {
  LOCKDOWN = 'lockdown',
  EVACUATION = 'evacuation',
  DRILL = 'drill',
  ALL_CLEAR = 'all_clear',
}

export class CreateEmergencyEventDto {
  @ApiProperty({ enum: EmergencyEventTypeEnum })
  @IsEnum(EmergencyEventTypeEnum)
  type: EmergencyEventTypeEnum;

  @ApiProperty({ description: 'Emergency message' })
  @IsString()
  message: string;
}

export class EmergencyEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  initiated_by: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  started_at: Date;

  @ApiProperty()
  ended_at?: Date;

  @ApiProperty()
  created_at: Date;
}
