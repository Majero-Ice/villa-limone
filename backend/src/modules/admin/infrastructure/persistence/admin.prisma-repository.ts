import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IAdminRepository } from '../../domain/repositories/admin.repository.interface';
import { Admin } from '../../domain/entities/admin.entity';
import { AdminPrismaMapper } from './admin.prisma-mapper';

@Injectable()
export class AdminPrismaRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Admin | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    return admin ? AdminPrismaMapper.toDomain(admin) : null;
  }

  async findById(id: string): Promise<Admin | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    return admin ? AdminPrismaMapper.toDomain(admin) : null;
  }
}
