import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReservationRepository, RESERVATION_REPOSITORY } from '../../../reservation/domain/repositories/reservation.repository.interface';

@Injectable()
export class DeleteReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    await this.reservationRepository.delete(id);
  }
}
