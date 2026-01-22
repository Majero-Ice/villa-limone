import { Admin } from '../../domain/entities/admin.entity';
import { Admin as PrismaAdmin } from '@prisma/client';

export class AdminPrismaMapper {
  static toDomain(prismaAdmin: PrismaAdmin): Admin {
    return Admin.create({
      id: prismaAdmin.id,
      email: prismaAdmin.email,
      passwordHash: prismaAdmin.passwordHash,
      createdAt: prismaAdmin.createdAt,
    });
  }
}
