import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IQuickReplyRepository, QuickReplyData } from '../../domain/repositories/quick-reply.repository.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class QuickReplyPrismaRepository implements IQuickReplyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<QuickReplyData[]> {
    const records = await this.prisma.quickReply.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return records.map((record) => ({
      id: record.id,
      trigger: record.trigger,
      response: record.response,
      isActive: record.isActive,
      sortOrder: record.sortOrder,
      createdAt: record.createdAt,
    }));
  }

  async findById(id: string): Promise<QuickReplyData | null> {
    const record = await this.prisma.quickReply.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      trigger: record.trigger,
      response: record.response,
      isActive: record.isActive,
      sortOrder: record.sortOrder,
      createdAt: record.createdAt,
    };
  }

  async create(data: Omit<QuickReplyData, 'id' | 'createdAt'>): Promise<QuickReplyData> {
    const record = await this.prisma.quickReply.create({
      data: {
        id: randomUUID(),
        trigger: data.trigger,
        response: data.response,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    return {
      id: record.id,
      trigger: record.trigger,
      response: record.response,
      isActive: record.isActive,
      sortOrder: record.sortOrder,
      createdAt: record.createdAt,
    };
  }

  async update(id: string, data: Partial<Omit<QuickReplyData, 'id' | 'createdAt'>>): Promise<QuickReplyData> {
    const record = await this.prisma.quickReply.update({
      where: { id },
      data: {
        trigger: data.trigger,
        response: data.response,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    return {
      id: record.id,
      trigger: record.trigger,
      response: record.response,
      isActive: record.isActive,
      sortOrder: record.sortOrder,
      createdAt: record.createdAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.quickReply.delete({
      where: { id },
    });
  }
}
