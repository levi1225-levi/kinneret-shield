import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { GoogleUserDto } from './dto/google-user.dto';
import { TokenDto, AuthResponseDto } from './dto/token.dto';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, name, inviteCode, studentNumber, grade, homeroom, department, position } = registerDto;

    // Verify invite code
    const invite = await this.prisma.inviteCode.findUnique({
      where: { code: inviteCode },
    });

    if (!invite) {
      throw new BadRequestException('Invalid invite code');
    }

    if (invite.used_at !== null) {
      throw new BadRequestException('Invite code already used');
    }

    if (new Date() > invite.expires_at) {
      throw new BadRequestException('Invite code expired');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }

    // Create user with role from invite code
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        role: invite.role,
        google_id: '',
      },
    });

    // Create role-specific profile
    await this.createRoleProfile(user.id, invite.role, {
      studentNumber,
      grade,
      homeroom,
      department,
      position,
    });

    // Mark invite as used
    await this.prisma.inviteCode.update({
      where: { id: invite.id },
      data: {
        used_by: user.id,
        used_at: new Date(),
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: 'REGISTER',
        entity_type: 'User',
        entity_id: user.id,
      },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      token,
    };
  }

  async validateGoogleUser(googleUserDto: GoogleUserDto): Promise<User> {
    let user = await this.prisma.user.findUnique({
      where: { google_id: googleUserDto.googleId },
    });

    if (!user) {
      // Check if email exists
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: googleUserDto.email },
      });

      if (existingEmail) {
        // Link Google ID to existing account
        user = await this.prisma.user.update({
          where: { id: existingEmail.id },
          data: { google_id: googleUserDto.googleId },
        });
      } else {
        // Create new user without invite code - they need to register first
        throw new UnauthorizedException(
          'No account found. Please register with an invite code first.',
        );
      }
    }

    // Update avatar if provided
    if (googleUserDto.avatar_url && !user.avatar_url) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { avatar_url: googleUserDto.avatar_url },
      });
    }

    return user;
  }

  login(user: User): AuthResponseDto {
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      token,
    };
  }

  private generateToken(user: User): TokenDto {
    const expiresIn = parseInt(process.env.JWT_EXPIRATION || '86400', 10);
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
      secret: process.env.JWT_SECRET,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  refreshToken(userId: string): TokenDto {
    const user = this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const expiresIn = parseInt(process.env.JWT_EXPIRATION || '86400', 10);
    const payload = {
      sub: userId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
      secret: process.env.JWT_SECRET,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  private async createRoleProfile(
    userId: string,
    role: UserRole,
    profileData: {
      studentNumber?: string;
      grade?: string;
      homeroom?: string;
      department?: string;
      position?: string;
    },
  ): Promise<void> {
    switch (role) {
      case UserRole.student:
        if (!profileData.studentNumber || !profileData.grade) {
          throw new BadRequestException(
            'Student number and grade are required for student role',
          );
        }
        await this.prisma.student.create({
          data: {
            user_id: userId,
            student_number: profileData.studentNumber,
            grade: profileData.grade,
            homeroom: profileData.homeroom,
          },
        });
        break;

      case UserRole.parent:
        await this.prisma.parent.create({
          data: { user_id: userId },
        });
        break;

      case UserRole.teacher:
        await this.prisma.teacher.create({
          data: {
            user_id: userId,
            department: profileData.department,
          },
        });
        break;

      case UserRole.security_guard:
      case UserRole.management:
        if (!profileData.position) {
          throw new BadRequestException('Position is required for staff roles');
        }
        await this.prisma.staff.create({
          data: {
            user_id: userId,
            position: profileData.position,
          },
        });
        break;
    }
  }
}
