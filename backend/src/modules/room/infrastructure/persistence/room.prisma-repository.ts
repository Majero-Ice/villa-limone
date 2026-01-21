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

  async findBySlug(slug: string): Promise<Room | null> {
    const record = await this.prisma.room.findUnique({
      where: { slug },
    });
    return record ? RoomPrismaMapper.toDomain(record) : null;
  }
}
