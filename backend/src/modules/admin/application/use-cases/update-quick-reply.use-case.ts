import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { QuickReplyDto } from '../dtos/quick-reply.dto';
import { UpdateQuickReplyDto } from '../dtos/quick-reply.dto';
import { IQuickReplyRepository, QUICK_REPLY_REPOSITORY } from '../../domain/repositories/quick-reply.repository.interface';

@Injectable()
export class UpdateQuickReplyUseCase {
  constructor(
    @Inject(QUICK_REPLY_REPOSITORY)
    private readonly quickReplyRepository: IQuickReplyRepository,
  ) {}

  async execute(id: string, dto: UpdateQuickReplyDto): Promise<QuickReplyDto> {
    const existing = await this.quickReplyRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Quick reply with ID ${id} not found`);
    }

    const quickReply = await this.quickReplyRepository.update(id, dto);

    return {
      id: quickReply.id,
      trigger: quickReply.trigger,
      response: quickReply.response,
      isActive: quickReply.isActive,
      sortOrder: quickReply.sortOrder,
      createdAt: quickReply.createdAt,
    };
  }
}
