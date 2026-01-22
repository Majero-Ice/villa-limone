import { Injectable, Inject } from '@nestjs/common';
import { QuickReplyDto } from '../dtos/quick-reply.dto';
import { IQuickReplyRepository, QUICK_REPLY_REPOSITORY } from '../../domain/repositories/quick-reply.repository.interface';

@Injectable()
export class GetAllQuickRepliesUseCase {
  constructor(
    @Inject(QUICK_REPLY_REPOSITORY)
    private readonly quickReplyRepository: IQuickReplyRepository,
  ) {}

  async execute(): Promise<QuickReplyDto[]> {
    const quickReplies = await this.quickReplyRepository.findAll();

    return quickReplies.map((qr) => ({
      id: qr.id,
      trigger: qr.trigger,
      response: qr.response,
      isActive: qr.isActive,
      sortOrder: qr.sortOrder,
      createdAt: qr.createdAt,
    }));
  }
}
