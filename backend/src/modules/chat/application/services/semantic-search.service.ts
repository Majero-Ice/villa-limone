import { Injectable, Inject } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import {
  IChunkRepository,
  CHUNK_REPOSITORY,
  SimilaritySearchResult,
  FindSimilarChunksOptions,
} from '../../domain/repositories/chunk.repository.interface';

@Injectable()
export class SemanticSearchService {
  constructor(
    private readonly embeddingsService: EmbeddingsService,
    @Inject(CHUNK_REPOSITORY)
    private readonly chunkRepository: IChunkRepository,
  ) {}

  async searchByText(query: string, options: FindSimilarChunksOptions = {}): Promise<SimilaritySearchResult[]> {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    const queryEmbedding = await this.embeddingsService.createEmbedding(query);

    return this.chunkRepository.findSimilarByEmbedding(queryEmbedding, options);
  }

  async searchByEmbedding(
    embedding: number[],
    options: FindSimilarChunksOptions = {},
  ): Promise<SimilaritySearchResult[]> {
    return this.chunkRepository.findSimilarByEmbedding(embedding, options);
  }
}
