import { ApiProperty } from '@nestjs/swagger';

export class RoomOccupancyDto {
  @ApiProperty()
  roomId: string;

  @ApiProperty()
  currentOccupancy: number;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  occupancyPercentage: number;

  @ApiProperty()
  isAtCapacity: boolean;

  @ApiProperty()
  timestamp: Date;
}
