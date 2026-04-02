import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Token type' })
  tokenType: string = 'Bearer';

  @ApiProperty({ description: 'Token expiration in seconds' })
  expiresIn: number;
}

export class AuthResponseDto {
  @ApiProperty()
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar_url?: string;
  };

  @ApiProperty()
  token: TokenDto;
}
