import { Room as PrismaRoom } from '@prisma/client';
import { Room } from '../../domain/entities/room.entity';
import { Price } from '../../domain/value-objects/price.vo';

export class RoomPrismaMapper {
  static toDomain(record: PrismaRoom): Room {
    return Room.create({
      id: record.id,
      slug: record.slug,
      name: record.name,
      description: record.description,
      capacity: record.capacity,
      pricePerNight: Price.fromCents(record.pricePerNight),
      imageUrl: record.imageUrl,
      features: record.features,
      isActive: record.isActive,
      sortOrder: record.sortOrder,
    });
  }
}
