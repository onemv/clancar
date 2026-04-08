import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import type { HealthResponse } from '../../common/types/health.types';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(HealthService)
    private readonly healthService: HealthService
  ) {}

  @ApiOkResponse({
    description: 'System health status',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-04-01T20:00:00.000Z',
        dependencies: {
          database: 'up',
          redis: 'up',
          storage: 'up'
        }
      }
    }
  })
  @Get()
  check(): Promise<HealthResponse> {
    return this.healthService.check();
  }
}
