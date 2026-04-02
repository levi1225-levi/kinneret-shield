import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoomType } from '@prisma/client';

export class CreateRoomDto {
  @ApiProperty({ description: 'Room name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Building name' })
  @IsString()
  building: string;

  @ApiProperty({ description: 'Floor number' })
  @IsNumber()
  floor: number;

  @ApiProperty({ description: 'Room number' })
  @IsString()
  room_number: string;

  @ApiProperty({
    enum: RoomType,
    description: 'Type of room',
  })
  @IsEnum(RoomType)
  type: RoomType;

  @ApiProperty({ description: 'Room capacity' })
  @IsNumber()
  capacity: number;
}
