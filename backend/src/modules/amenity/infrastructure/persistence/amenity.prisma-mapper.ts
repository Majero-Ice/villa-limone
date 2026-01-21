import { Amenity as PrismaAmenity } from '@prisma/client';
import { Amenity } from '../../domain/entities/amenity.entity';

export class AmenityPrismaMapper {
  static toDomain(record: PrismaAmenity): Amenity {
    return Amenity.create({
      id: record.id,
      name: record.name,
      description: record.description,
      icon: record.icon,
      category: record.category,
      sortOrder: record.sortOrder,
      isActive: record.isActive,
    });
  }
}
