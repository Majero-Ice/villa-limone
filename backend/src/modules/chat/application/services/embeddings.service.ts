import { Injectable, Inject, Logger } from '@nestjs/common';
import { AI_PROVIDER } from '../../../../shared/infrastructure/ai/ai.constants';
import { EmbeddingsProvider } from '../../../../shared/infrastructure/ai/interfaces/ai-provider.interface';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  constructor(
    @Inject(AI_PROVIDER)
    private readonly aiProvider: EmbeddingsProvider,
  ) {}

  async createEmbeddings(texts: string[], model: string = 'text-embedding-3-small'): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    this.logger.debug(`[createEmbeddings] Generating ${texts.length} embeddings...`);
    const embeddings = await this.aiProvider.createEmbeddings(texts, model);
    
    return embeddings;
  }

  async createEmbedding(text: string, model: string = 'text-embedding-3-small'): Promise<number[]> {
    const embeddings = await this.createEmbeddings([text], model);
    return embeddings[0];
  }
}
