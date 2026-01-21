import { Reservation, ReservationStatus } from '../../domain/entities/reservation.entity';
import { Price } from '../../../room/domain/value-objects/price.vo';
import { Prisma } from '@prisma/client';

export class ReservationPrismaMapper {
  static toDomain(record: Prisma.ReservationGetPayload<{ include: { room: true } }>): Reservation {
    return Reservation.create({
      id: record.id,
      roomId: record.roomId,
      guestName: record.guestName,
      guestEmail: record.guestEmail,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      guestsCount: record.guestsCount,
      totalPrice: Price.fromCents(record.totalPrice),
      status: record.status as ReservationStatus,
      specialRequests: record.specialRequests ?? undefined,
      conversationId: record.conversationId ?? undefined,
    });
  }
}
