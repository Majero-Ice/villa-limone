import { Injectable, Inject } from '@nestjs/common';
import { ConversationListQueryDto } from '../dtos/conversation-list-query.dto';
import { ConversationListResponseDto } from '../dtos/conversation-list-response.dto';
import { ConversationDto } from '../dtos/conversation.dto';
import { IConversationRepository, CONVERSATION_REPOSITORY } from '../../../chat/domain/repositories/conversation.repository.interface';

@Injectable()
export class GetAllConversationsUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async execute(query: ConversationListQueryDto): Promise<ConversationListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const orderBy = query.orderBy ?? 'createdAt';
    const order = query.order ?? 'desc';

    const { conversations, total } = await this.conversationRepository.findAll(page, limit, orderBy, order);

    const conversationDtos: ConversationDto[] = conversations.map((conv) => ({
      id: conv.id,
      sessionId: conv.sessionId,
      hasReservation: conv.hasReservation,
      messageCount: conv.messageCount,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      firstMessage: conv.messages && conv.messages.length > 0 ? conv.messages[0].content.substring(0, 100) : undefined,
    }));

    return {
      conversations: conversationDtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
