import { Injectable, Inject } from '@nestjs/common';
import { QuickReplyDto } from '../dtos/quick-reply.dto';
import { CreateQuickReplyDto } from '../dtos/quick-reply.dto';
import { IQuickReplyRepository, QUICK_REPLY_REPOSITORY } from '../../domain/repositories/quick-reply.repository.interface';

@Injectable()
export class CreateQuickReplyUseCase {
  constructor(
    @Inject(QUICK_REPLY_REPOSITORY)
    private readonly quickReplyRepository: IQuickReplyRepository,
  ) {}

  async execute(dto: CreateQuickReplyDto): Promise<QuickReplyDto> {
    const quickReply = await this.quickReplyRepository.create({
      trigger: dto.trigger,
      response: dto.response,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });

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
