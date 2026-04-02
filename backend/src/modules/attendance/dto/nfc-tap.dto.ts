import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NfcTapDto {
  @ApiProperty({ description: 'NFC card UID' })
  @IsString()
  cardUid: string;
}

export class NfcTapResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  studentId?: string;

  @ApiProperty({ required: false })
  studentName?: string;

  @ApiProperty({ required: false })
  action?: 'check_in' | 'check_out';

  @ApiProperty({ required: false })
  timestamp?: Date;
}
