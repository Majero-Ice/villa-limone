import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth(): Promise<{ status: string; database: string; timestamp: string }> {
    let databaseStatus = 'disconnected';
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (error) {
      databaseStatus = 'disconnected';
    }

    return {
      status: 'ok',
      database: databaseStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
