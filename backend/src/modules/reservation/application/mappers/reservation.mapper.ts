import { Reservation, ReservationStatus } from '../../domain/entities/reservation.entity';
import { ReservationDto, ReservationRoomDto } from '../dtos/reservation.dto';
import { Prisma } from '@prisma/client';

export class ReservationMapper {
  static toDto(
    reservation: Reservation,
    room?: { id: string; slug: string; name: string },
    timestamps?: { createdAt: Date; updatedAt: Date },
  ): ReservationDto {
    const dto: ReservationDto = {
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
      createdAt: timestamps?.createdAt ?? new Date(),
      updatedAt: timestamps?.updatedAt ?? new Date(),
    };

    if (room) {
      dto.room = {
        id: room.id,
        slug: room.slug,
        name: room.name,
      };
    }

    return dto;
  }

  static toDtoFromPrisma(
    record: Prisma.ReservationGetPayload<{ include: { room: true } }>,
  ): ReservationDto {
    return {
      id: record.id,
      roomId: record.roomId,
      room: {
        id: record.room.id,
        slug: record.room.slug,
        name: record.room.name,
      },
      guestName: record.guestName,
      guestEmail: record.guestEmail,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      guestsCount: record.guestsCount,
      totalPrice: record.totalPrice,
      status: record.status,
      specialRequests: record.specialRequests ?? undefined,
      conversationId: record.conversationId ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
