import { Injectable, Inject } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { IChunkRepository, CHUNK_REPOSITORY, SimilaritySearchResult } from '../../domain/repositories/chunk.repository.interface';

@Injectable()
export class RAGService {
  constructor(
    @Inject(CHUNK_REPOSITORY)
    private readonly chunkRepository: IChunkRepository,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async retrieveRelevantKnowledge(query: string, limit: number = 5, threshold: number = 0.7): Promise<SimilaritySearchResult[]> {
    const queryEmbedding = await this.embeddingsService.createEmbedding(query);
    
    const results = await this.chunkRepository.findSimilarByEmbedding(queryEmbedding, {
      limit,
      threshold,
    });

    return results;
  }

  formatKnowledgeForPrompt(results: SimilaritySearchResult[]): string {
    if (results.length === 0) {
      return '';
    }

    const knowledgeSections = results.map((result, index) => {
      const fileName = result.chunk.metadata?.fileName || 'Unknown';
      return `[Knowledge ${index + 1} - Source: ${fileName}]
${result.chunk.content}
(Relevance: ${(result.similarity * 100).toFixed(1)}%)`;
    });

    return `
═══════════════════════════════════════════════════════════════
RELEVANT KNOWLEDGE BASE INFORMATION
═══════════════════════════════════════════════════════════════

${knowledgeSections.join('\n\n')}

═══════════════════════════════════════════════════════════════
Use the information above to answer questions accurately. If the knowledge base doesn't contain relevant information, say so honestly.
═══════════════════════════════════════════════════════════════
`;
  }
}
