import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async health() {
    const status = await this.healthService.checkHealth();
    return {
      status: status.ok ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: status,
    };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is ready to accept requests' })
  async ready() {
    const isReady = await this.healthService.isReady();
    if (!isReady) {
      return { status: 'not_ready' };
    }
    return { status: 'ready' };
  }
}
