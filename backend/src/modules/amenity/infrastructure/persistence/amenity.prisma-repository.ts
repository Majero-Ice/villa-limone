import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IAmenityRepository } from '../../domain/repositories/amenity.repository.interface';
import { Amenity } from '../../domain/entities/amenity.entity';
import { AmenityPrismaMapper } from './amenity.prisma-mapper';

@Injectable()
export class AmenityPrismaRepository implements IAmenityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Amenity[]> {
    const records = await this.prisma.amenity.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
    return records.map(AmenityPrismaMapper.toDomain);
  }
}
