import { Injectable, Inject } from '@nestjs/common';
import { IReservationRepository, RESERVATION_REPOSITORY } from '../../domain/repositories/reservation.repository.interface';
import { AvailabilityRequestDto } from '../dtos/availability-request.dto';
import { AvailabilityResponseDto } from '../dtos/availability-response.dto';

@Injectable()
export class CheckAvailabilityUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(dto: AvailabilityRequestDto): Promise<AvailabilityResponseDto> {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);

    if (checkIn >= checkOut) {
      throw new Error('Check-in date must be before check-out date');
    }

    if (checkIn < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error('Check-in date cannot be in the past');
    }

    const availableRooms = await this.reservationRepository.findAvailableRooms(
      checkIn,
      checkOut,
      dto.guests,
    );

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const roomsWithTotal = availableRooms.map((room) => ({
      id: room.id,
      slug: room.slug,
      name: room.name,
      capacity: room.capacity,
      pricePerNight: room.pricePerNight,
      totalPrice: room.pricePerNight * nights,
      nights,
    }));

    return {
      availableRooms: roomsWithTotal,
    };
  }
}
