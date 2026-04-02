import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  building: string;

  @ApiProperty()
  floor: number;

  @ApiProperty()
  room_number: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
