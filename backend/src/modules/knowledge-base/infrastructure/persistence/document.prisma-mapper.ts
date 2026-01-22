import { Document } from '../../domain/entities/document.entity';
import { Prisma } from '@prisma/client';

export class DocumentPrismaMapper {
  static toDomain(record: Prisma.DocumentGetPayload<{}>): Document {
    return Document.create({
      id: record.id,
      name: record.name,
      type: record.type,
      sourceUrl: record.sourceUrl || undefined,
      storageUrl: record.storageUrl || undefined,
      content: record.content || undefined,
      contentHash: record.contentHash || undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
