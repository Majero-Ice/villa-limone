import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';
import { DocumentPrismaMapper } from './document.prisma-mapper';

@Injectable()
export class DocumentPrismaRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Document[]> {
    const records = await this.prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map(DocumentPrismaMapper.toDomain);
  }

  async findById(id: string): Promise<Document | null> {
    const record = await this.prisma.document.findUnique({
      where: { id },
    });
    return record ? DocumentPrismaMapper.toDomain(record) : null;
  }

  async create(document: Document): Promise<Document> {
    const record = await this.prisma.document.create({
      data: {
        id: document.id,
        name: document.name,
        type: document.type,
        sourceUrl: document.sourceUrl,
        storageUrl: document.storageUrl,
        content: document.content,
        contentHash: document.contentHash,
      },
    });
    return DocumentPrismaMapper.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({
      where: { id },
    });
  }

  async findByContentHash(contentHash: string): Promise<Document | null> {
    const record = await this.prisma.document.findFirst({
      where: { contentHash },
    });
    return record ? DocumentPrismaMapper.toDomain(record) : null;
  }
}
