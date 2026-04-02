import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeviceAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing device authentication token');
    }

    const [type, credentials] = authHeader.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedException('Invalid authentication type');
    }

    try {
      const [deviceId, secret] = Buffer.from(credentials, 'base64')
        .toString('utf-8')
        .split(':');

      if (!deviceId || !secret) {
        throw new UnauthorizedException('Invalid device credentials format');
      }

      // Verify secret matches environment
      if (secret !== process.env.DEVICE_AUTH_SECRET) {
        throw new UnauthorizedException('Invalid device authentication secret');
      }

      // Verify device exists and is active
      const device = await this.prisma.device.findUnique({
        where: { id: deviceId },
        include: { room: true },
      });

      if (!device) {
        throw new UnauthorizedException('Device not found');
      }

      request.device = {
        deviceId: device.id,
        serialNumber: device.serial_number,
        roomId: device.room_id,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid device authentication');
    }
  }
}
