import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IConversationRepository, ConversationData } from '../../domain/repositories/conversation.repository.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class ConversationPrismaRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySessionId(sessionId: string): Promise<ConversationData | null> {
    const record = await this.prisma.conversation.findFirst({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return null;
    }

    return this.mapToConversationData(record);
  }

  async create(sessionId: string): Promise<ConversationData> {
    const record = await this.prisma.conversation.create({
      data: {
        id: randomUUID(),
        sessionId,
        hasReservation: false,
        messageCount: 0,
        metadata: {},
      },
      include: {
        messages: true,
      },
    });

    return this.mapToConversationData(record);
  }

  async updateContext(conversationId: string, context: any): Promise<void> {
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        metadata: context,
      },
    });
  }

  async addMessage(
    conversationId: string,
    message: { role: 'USER' | 'ASSISTANT' | 'SYSTEM'; content: string; metadata?: any },
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          id: randomUUID(),
          conversationId,
          role: message.role,
          content: message.content,
          metadata: message.metadata || null,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          messageCount: { increment: 1 },
        },
      });
    });
  }

  async findById(id: string): Promise<ConversationData | null> {
    const record = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!record) {
      return null;
    }

    return this.mapToConversationData(record);
  }

  private mapToConversationData(record: any): ConversationData {
    return {
      id: record.id,
      sessionId: record.sessionId,
      hasReservation: record.hasReservation,
      messageCount: record.messageCount,
      metadata: record.metadata,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      messages: record.messages?.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        metadata: msg.metadata,
        createdAt: msg.createdAt,
      })),
    };
  }
}
