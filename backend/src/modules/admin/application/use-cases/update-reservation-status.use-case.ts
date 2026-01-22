import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReservationRepository, RESERVATION_REPOSITORY } from '../../../reservation/domain/repositories/reservation.repository.interface';
import { UpdateReservationStatusDto } from '../dtos/update-reservation-status.dto';
import { ReservationDto } from '../../../reservation/application/dtos/reservation.dto';
import { ReservationMapper } from '../../../reservation/application/mappers/reservation.mapper';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class UpdateReservationStatusUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, dto: UpdateReservationStatusDto): Promise<ReservationDto> {
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    if (dto.status === 'CONFIRMED') {
      reservation.confirm();
    } else if (dto.status === 'CANCELLED') {
      reservation.cancel();
    } else {
      (reservation as any).props.status = dto.status;
    }

    await this.reservationRepository.update(reservation);

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
