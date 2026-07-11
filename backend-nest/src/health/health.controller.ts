import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../common/decorators/public.decorator';
import type { HealthCheckResult } from './health.types';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Check system health status' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy',
  })
  @ApiResponse({
    status: 503,
    description: 'One or more dependencies are unhealthy',
  })
  async check(): Promise<HealthCheckResult> {
    return this.healthService.check();
  }
}
