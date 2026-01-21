import { Reservation, ReservationStatus } from '../../domain/entities/reservation.entity';
import { ReservationDto } from '../dtos/reservation.dto';

export class ReservationMapper {
  static toDto(reservation: Reservation): ReservationDto {
    return {
      id: reservation.id,
      roomId: reservation.roomId,
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      guestsCount: reservation.guestsCount,
      totalPrice: reservation.totalPrice.inCents,
      status: reservation.status,
      specialRequests: reservation.specialRequests,
      conversationId: reservation.conversationId,
    };
  }
}
