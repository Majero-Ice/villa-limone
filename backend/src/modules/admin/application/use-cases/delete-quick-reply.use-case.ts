import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IQuickReplyRepository, QUICK_REPLY_REPOSITORY } from '../../domain/repositories/quick-reply.repository.interface';

@Injectable()
export class DeleteQuickReplyUseCase {
  constructor(
    @Inject(QUICK_REPLY_REPOSITORY)
    private readonly quickReplyRepository: IQuickReplyRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.quickReplyRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Quick reply with ID ${id} not found`);
    }

    await this.quickReplyRepository.delete(id);
  }
}
