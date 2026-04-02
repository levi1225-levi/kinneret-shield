import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class HealthService {
  private logger = new Logger(HealthService.name);

  constructor(private prisma: PrismaService) {}

  async checkHealth() {
    const health = {
      ok: true,
      database: false,
      timestamp: new Date().toISOString(),
    };

    try {
      const dbHealth = await this.prisma.health();
      health.database = dbHealth;
      health.ok = health.ok && dbHealth;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      health.database = false;
      health.ok = false;
    }

    return health;
  }

  async isReady(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.ok && health.database;
    } catch (error) {
      this.logger.error('Readiness check failed:', error);
      return false;
    }
  }
}
