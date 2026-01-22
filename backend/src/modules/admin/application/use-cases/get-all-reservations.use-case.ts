import { Injectable } from '@nestjs/common';
import { ReservationListQueryDto } from '../dtos/reservation-list-query.dto';
import { ReservationListResponseDto } from '../dtos/reservation-list-response.dto';
import { ReservationMapper } from '../../../reservation/application/mappers/reservation.mapper';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { ReservationStatus } from '../../../reservation/domain/entities/reservation.entity';

@Injectable()
export class GetAllReservationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ReservationListQueryDto): Promise<ReservationListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const orderBy = query.orderBy ?? 'createdAt';
    const order = query.order ?? 'desc';

    const where: any = {};
    if (query.status) {
      where.status = query.status as ReservationStatus;
    }

    const [records, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        include: {
          room: true,
        },
        skip,
        take: limit,
        orderBy: {
          [orderBy]: order,
        },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    const reservations = records.map(ReservationMapper.toDtoFromPrisma);

    return {
      reservations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
