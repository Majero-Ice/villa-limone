import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IReservationRepository } from '../../domain/repositories/reservation.repository.interface';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationPrismaMapper } from './reservation.prisma-mapper';
import { Price } from '../../../room/domain/value-objects/price.vo';

@Injectable()
export class ReservationPrismaRepository implements IReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(reservation: Reservation): Promise<Reservation> {
    const record = await this.prisma.reservation.create({
      data: {
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
      },
      include: {
        room: true,
      },
    });

    return ReservationPrismaMapper.toDomain(record);
  }

  async findById(id: string): Promise<Reservation | null> {
    const record = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });

    return record ? ReservationPrismaMapper.toDomain(record) : null;
  }

  async findAvailableRooms(
    checkIn: Date,
    checkOut: Date,
    guests: number,
  ): Promise<Array<{ id: string; slug: string; name: string; capacity: number; pricePerNight: number }>> {
    const checkInDate = new Date(checkIn);
    checkInDate.setHours(0, 0, 0, 0);
    const checkOutDate = new Date(checkOut);
    checkOutDate.setHours(0, 0, 0, 0);

    const allRooms = await this.prisma.room.findMany({
      where: {
        isActive: true,
        capacity: {
          gte: guests,
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const reservations = await this.prisma.reservation.findMany({
      where: {
        status: {
          not: 'CANCELLED',
        },
        OR: [
          {
            AND: [
              { checkIn: { lte: checkOutDate } },
              { checkOut: { gte: checkInDate } },
            ],
          },
        ],
      },
      select: {
        roomId: true,
      },
    });

    const blockedRoomIds = new Set(reservations.map((r) => r.roomId));

    const blockedDates = await this.prisma.roomAvailability.findMany({
      where: {
        isBlocked: true,
        date: {
          gte: checkInDate,
          lt: checkOutDate,
        },
      },
      select: {
        roomId: true,
      },
    });

    blockedDates.forEach((bd) => blockedRoomIds.add(bd.roomId));

    const availableRooms = allRooms
      .filter((room) => !blockedRoomIds.has(room.id))
      .map((room) => ({
        id: room.id,
        slug: room.slug,
        name: room.name,
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
      }));

    return availableRooms;
  }
}
