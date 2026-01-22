import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { GetDashboardStatsUseCase } from '../application/use-cases/get-dashboard-stats.use-case';

@Controller('api/admin/dashboard')
@UseGuards(JwtAuthGuard)
export class AdminDashboardController {
  constructor(private readonly getDashboardStats: GetDashboardStatsUseCase) {}

  @Get('stats')
  getStats() {
    return this.getDashboardStats.execute();
  }
}
