import { Controller, Post, Body, UseGuards, Request, Get, Redirect } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, TokenDto } from './dto/token.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user with invite code' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid invite code or user already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google OAuth' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Request() req: any): Promise<AuthResponseDto> {
    return this.authService.login(req.user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google login' })
  googleLogin() {
    // This is handled by Passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  @ApiOperation({ summary: 'Google OAuth callback' })
  googleCallback(@Request() req: any) {
    // Redirect to frontend with token
    const response = this.authService.login(req.user);
    return {
      url: `${process.env.CORS_ORIGIN}/auth/callback?token=${response.token.accessToken}`,
      statusCode: 302,
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, type: TokenDto })
  refreshToken(@CurrentUser() user: CurrentUserPayload): TokenDto {
    return this.authService.refreshToken(user.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200 })
  getCurrentUser(@CurrentUser() user: CurrentUserPayload) {
    return {
      id: user.sub,
      email: user.email,
      role: user.role,
    };
  }
}
