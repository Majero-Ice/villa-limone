import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReservationRepository, RESERVATION_REPOSITORY } from '../../../reservation/domain/repositories/reservation.repository.interface';
import { ReservationDto } from '../../../reservation/application/dtos/reservation.dto';
import { ReservationMapper } from '../../../reservation/application/mappers/reservation.mapper';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class GetReservationByIdUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string): Promise<ReservationDto> {
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    const record = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return ReservationMapper.toDtoFromPrisma(record);
  }
}
