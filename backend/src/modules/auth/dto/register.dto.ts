import { IsString, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Google ID token' })
  @IsString()
  googleIdToken: string;

  @ApiProperty({ description: 'Invite code for registration' })
  @IsString()
  inviteCode: string;

  @ApiProperty({
    description: 'Student number (required for student role)',
    required: false,
  })
  @IsString()
  studentNumber?: string;

  @ApiProperty({
    description: 'Grade (required for student role)',
    required: false,
  })
  @IsString()
  grade?: string;

  @ApiProperty({
    description: 'Homeroom (optional for student role)',
    required: false,
  })
  @IsString()
  homeroom?: string;

  @ApiProperty({
    description: 'Department (optional for teacher role)',
    required: false,
  })
  @IsString()
  department?: string;

  @ApiProperty({
    description: 'Position (required for staff role)',
    required: false,
  })
  @IsString()
  position?: string;
}
