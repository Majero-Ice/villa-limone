import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IRoomRepository } from '../../domain/repositories/room.repository.interface';
import { Room } from '../../domain/entities/room.entity';
import { RoomPrismaMapper } from './room.prisma-mapper';

@Injectable()
export class RoomPrismaRepository implements IRoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Room[]> {
    const records = await this.prisma.room.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return records.map(RoomPrismaMapper.toDomain);
  }

  async findAllActive(): Promise<Room[]> {
    const records = await this.prisma.room.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return records.map(RoomPrismaMapper.toDomain);
  }

  async findBySlug(slug: string): Promise<Room | null> {
    const record = await this.prisma.room.findUnique({
      where: { slug },
    });
    return record ? RoomPrismaMapper.toDomain(record) : null;
  }

  async findAvailable(checkIn: Date, checkOut: Date, guests: number): Promise<Room[]> {
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

    const availableRooms = allRooms.filter((room) => !blockedRoomIds.has(room.id));

    return availableRooms.map(RoomPrismaMapper.toDomain);
  }
}
