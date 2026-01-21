import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IReservationRepository, RESERVATION_REPOSITORY } from '../../domain/repositories/reservation.repository.interface';
import { Reservation, ReservationStatus } from '../../domain/entities/reservation.entity';
import { Price } from '../../../room/domain/value-objects/price.vo';
import { CreateReservationDto } from '../dtos/create-reservation.dto';
import { ReservationDto } from '../dtos/reservation.dto';
import { ReservationMapper } from '../mappers/reservation.mapper';

@Injectable()
export class CreateReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(dto: CreateReservationDto): Promise<ReservationDto> {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);

    if (checkIn >= checkOut) {
      throw new BadRequestException('Check-in date must be before check-out date');
    }

    if (checkIn < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    const availableRooms = await this.reservationRepository.findAvailableRooms(
      checkIn,
      checkOut,
      dto.guestsCount,
    );

    const selectedRoom = availableRooms.find((room) => room.id === dto.roomId);
    if (!selectedRoom) {
      throw new BadRequestException('Selected room is not available for the requested dates');
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = Price.fromCents(selectedRoom.pricePerNight * nights);

    const reservation = Reservation.create({
      id: randomUUID(),
      roomId: dto.roomId,
      guestName: dto.guestName,
      guestEmail: dto.guestEmail,
      checkIn,
      checkOut,
      guestsCount: dto.guestsCount,
      totalPrice,
      status: ReservationStatus.PENDING,
      specialRequests: dto.specialRequests,
      conversationId: dto.conversationId,
    });

    const created = await this.reservationRepository.create(reservation);
    return ReservationMapper.toDto(created);
  }
}
