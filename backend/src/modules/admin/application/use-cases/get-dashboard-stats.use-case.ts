import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { DashboardStatsDto } from '../dtos/dashboard-stats.dto';
import { ReservationStatus } from '../../../reservation/domain/entities/reservation.entity';

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<DashboardStatsDto> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      revenueResult,
      recentReservationsCount,
    ] = await Promise.all([
      this.prisma.reservation.count(),
      this.prisma.reservation.count({
        where: { status: ReservationStatus.PENDING },
      }),
      this.prisma.reservation.count({
        where: { status: ReservationStatus.CONFIRMED },
      }),
      this.prisma.reservation.count({
        where: { status: ReservationStatus.CANCELLED },
      }),
      this.prisma.reservation.aggregate({
        where: {
          status: {
            in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING],
          },
        },
        _sum: {
          totalPrice: true,
        },
      }),
      this.prisma.reservation.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
    ]);

    return {
      totalReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      totalRevenue: revenueResult._sum.totalPrice ?? 0,
      recentReservationsCount,
    };
  }
}
