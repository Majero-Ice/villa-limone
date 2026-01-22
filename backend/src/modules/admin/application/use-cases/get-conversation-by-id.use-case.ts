import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ConversationDetailDto } from '../dtos/conversation-detail.dto';
import { IConversationRepository, CONVERSATION_REPOSITORY } from '../../../chat/domain/repositories/conversation.repository.interface';

@Injectable()
export class GetConversationByIdUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async execute(id: string): Promise<ConversationDetailDto> {
    const conversation = await this.conversationRepository.findById(id);

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return {
      id: conversation.id,
      sessionId: conversation.sessionId,
      hasReservation: conversation.hasReservation,
      messageCount: conversation.messageCount,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: (conversation.messages || []).map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        metadata: msg.metadata,
        createdAt: msg.createdAt,
      })),
    };
  }
}
