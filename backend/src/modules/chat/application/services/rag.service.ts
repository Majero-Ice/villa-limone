import { Injectable, Inject, Logger } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { IChunkRepository, CHUNK_REPOSITORY, SimilaritySearchResult } from '../../domain/repositories/chunk.repository.interface';
import { ChatProvider } from '../../../../shared/infrastructure/ai/interfaces/ai-provider.interface';
import { AI_PROVIDER } from '../../../../shared/infrastructure/ai/ai.constants';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);

  constructor(
    @Inject(CHUNK_REPOSITORY)
    private readonly chunkRepository: IChunkRepository,
    private readonly embeddingsService: EmbeddingsService,
    @Inject(AI_PROVIDER)
    private readonly chatProvider: ChatProvider,
    private readonly prisma: PrismaService,
  ) {}

  async retrieveRelevantKnowledge(
    query: string,
    options?: { limit?: number; threshold?: number },
  ): Promise<SimilaritySearchResult[]> {
    const { limit = 5, threshold = 0.5 } = options || {};
    
    this.logger.log(`[RAG] Original query: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);
    
    const englishQuery = await this.translateToEnglish(query);
    if (englishQuery !== query) {
      this.logger.log(`[RAG] Translated query: "${englishQuery}"`);
    }
    
    this.logger.debug(`[RAG] Search parameters: limit=${limit}, threshold=${threshold}`);
    
    const hypotheticalDoc = await this.generateHypotheticalDocument(englishQuery);
    this.logger.log(`[RAG] HyDE document: "${hypotheticalDoc.substring(0, 150)}${hypotheticalDoc.length > 150 ? '...' : ''}"`);
    
    const queryEmbedding = await this.embeddingsService.createEmbedding(hypotheticalDoc);
    this.logger.debug(`[RAG] Generated embedding vector (length: ${queryEmbedding.length})`);
    
    // Временный дебаг: проверка векторов и similarity
    await this.debugEmbeddings(hypotheticalDoc, queryEmbedding);
    
    const initialResults = await this.chunkRepository.findSimilarByEmbedding(queryEmbedding, {
      limit: limit * 3,
      threshold: Math.max(threshold - 0.1, 0.1),
    });

    this.logger.log(`[RAG] Found ${initialResults.length} chunks in initial search`);
    
    if (initialResults.length === 0) {
      this.logger.warn(`[RAG] No chunks found above threshold ${threshold}. Consider lowering threshold or checking embeddings.`);
      return [];
    }

    const rerankedResults = this.rerankResults(query, initialResults);
    const finalResults = rerankedResults.slice(0, limit);

    this.logger.log(`[RAG] After re-ranking, selected ${finalResults.length} top chunks`);
    
    if (finalResults.length > 0) {
      this.logger.log(`[RAG] Top chunks with similarity scores:`);
      finalResults.forEach((result, index) => {
        const source = result.chunk.metadata?.fileName || 'Unknown';
        const similarityPercent = (result.similarity * 100).toFixed(2);
        const contentPreview = result.chunk.content.substring(0, 100).replace(/\n/g, ' ');
        this.logger.log(
          `  [${index + 1}] Source: ${source}, Similarity: ${similarityPercent}%, Preview: "${contentPreview}..."`,
        );
      });
    }

    return finalResults;
  }

  private async generateHypotheticalDocument(query: string): Promise<string> {
    try {
      const response = await this.chatProvider.chat(
        [
          {
            role: 'system',
            content: `You are writing content for Villa Limone, a boutique hotel on the Italian Riviera.

Given a user question, write a brief answer (2-4 sentences) as it might appear in the hotel's documentation or FAQ.

Rules:
- Write in descriptive, informative style
- Include realistic details a hotel might have
- Do not say "I don't know" or "I'm not sure"
- Do not include greetings or conversational phrases
- Just write the factual content directly`,
          },
          { role: 'user', content: query },
        ],
        'gpt-4o-mini',
      );

      const hypotheticalDoc = response.content?.trim() || query;
      this.logger.debug(`[RAG] HyDE generated: "${hypotheticalDoc}"`);
      return hypotheticalDoc;
    } catch (error) {
      this.logger.warn(`[RAG] HyDE generation failed: ${error instanceof Error ? error.message : 'Unknown error'}, using original query`);
      return query;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  private async debugEmbeddings(query: string, queryEmbedding: number[]): Promise<void> {
    try {
      const awardsChunk = await this.prisma.$queryRawUnsafe<Array<{ embedding: string }>>(
        `SELECT embedding::text FROM "Chunk" WHERE content LIKE '%Awards & Recognition%' LIMIT 1`,
      );

      if (awardsChunk.length === 0) {
        this.logger.warn('[DEBUG] No chunk found with "Awards & Recognition" in content');
        return;
      }

      const embeddingText = awardsChunk[0].embedding;
      let chunkEmbedding: number[];
      
      if (embeddingText.startsWith('[')) {
        chunkEmbedding = JSON.parse(embeddingText);
      } else if (embeddingText.startsWith('{')) {
        chunkEmbedding = JSON.parse(embeddingText.replace(/^\{/, '[').replace(/\}$/, ']'));
      } else {
        this.logger.warn(`[DEBUG] Unknown embedding format: ${embeddingText.substring(0, 50)}...`);
        return;
      }

      const jsSimilarity = this.cosineSimilarity(queryEmbedding, chunkEmbedding);

      const queryMagnitude = Math.sqrt(queryEmbedding.reduce((s: number, v: number) => s + v * v, 0));
      const chunkMagnitude = Math.sqrt(chunkEmbedding.reduce((s: number, v: number) => s + v * v, 0));

      this.logger.log(`[DEBUG] Query: "${query}"`);
      this.logger.log(`[DEBUG] Query magnitude: ${queryMagnitude.toFixed(6)}`);
      this.logger.log(`[DEBUG] Chunk magnitude: ${chunkMagnitude.toFixed(6)}`);
      this.logger.log(`[DEBUG] JS cosine similarity: ${jsSimilarity.toFixed(6)}`);
      this.logger.log(`[DEBUG] Query first 5 values: [${queryEmbedding.slice(0, 5).map((v: number) => v.toFixed(6)).join(', ')}]`);
      this.logger.log(`[DEBUG] Chunk first 5 values: [${chunkEmbedding.slice(0, 5).map((v: number) => v.toFixed(6)).join(', ')}]`);
    } catch (error) {
      this.logger.warn(`[DEBUG] Failed to debug embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async translateToEnglish(query: string): Promise<string> {
    const hasCyrillic = /[а-яёА-ЯЁ]/.test(query);
    if (!hasCyrillic) {
      return query;
    }

    try {
      const response = await this.chatProvider.chat(
        [
          {
            role: 'system',
            content: 'Translate to English. Return ONLY the translation, no explanations.',
          },
          { role: 'user', content: query },
        ],
        'gpt-4o-mini',
      );

      const translated = response.content?.trim() || query;
      this.logger.debug(`[RAG] Translation: "${query}" → "${translated}"`);
      return translated;
    } catch (error) {
      this.logger.warn(`[RAG] Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}, using original query`);
      return query;
    }
  }

  private rerankResults(query: string, results: SimilaritySearchResult[]): SimilaritySearchResult[] {
    const queryLower = query.toLowerCase();
    const queryWords = new Set(queryLower.split(/\s+/).filter(w => w.length > 2));
    
    if (queryWords.size === 0) {
      return results;
    }
    
    const scored = results.map((result) => {
      const content = result.chunk.content.toLowerCase();
      const contentWords = new Set(content.split(/\s+/).filter(w => w.length > 2));
      
      let keywordMatches = 0;
      let exactMatches = 0;
      
      for (const word of queryWords) {
        if (contentWords.has(word)) {
          keywordMatches += 1;
        }
        
        const wordOccurrences = (content.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length;
        exactMatches += wordOccurrences;
      }
      
      const keywordMatchRatio = keywordMatches / queryWords.size;
      const exactMatchBonus = Math.min(exactMatches / (queryWords.size * 2), 0.15);
      
      const boost = keywordMatchRatio * 0.1 + exactMatchBonus;
      const boostedSimilarity = Math.min(result.similarity + boost, 1.0);
      
      return {
        ...result,
        similarity: boostedSimilarity,
        _originalSimilarity: result.similarity,
        _keywordMatches: keywordMatches,
        _exactMatches: exactMatches,
      };
    });
    
    const sorted = scored.sort((a, b) => {
      if (Math.abs(a.similarity - b.similarity) < 0.01) {
        return b._originalSimilarity - a._originalSimilarity;
      }
      return b.similarity - a.similarity;
    });
    
    this.logger.debug(
      `[RAG] Re-ranking: top 3 - original: ${sorted.slice(0, 3).map(r => r._originalSimilarity.toFixed(3)).join(', ')}, boosted: ${sorted.slice(0, 3).map(r => r.similarity.toFixed(3)).join(', ')}`,
    );
    
    return sorted.map(({ _originalSimilarity, _keywordMatches, _exactMatches, ...result }) => result);
  }

  formatKnowledgeForPrompt(results: SimilaritySearchResult[]): string {
    if (results.length === 0) {
      return '';
    }

    const context = results
      .map((chunk, i) => {
        const source = chunk.chunk.metadata?.fileName || 'Unknown';
        const parts: string[] = [];
        
        if (chunk.chunk.metadata?.contextBefore) {
          parts.push(`[Context: ${chunk.chunk.metadata.contextBefore}]`);
        }
        
        parts.push(chunk.chunk.content);
        
        if (chunk.chunk.metadata?.contextAfter) {
          parts.push(`[Continues: ${chunk.chunk.metadata.contextAfter}]`);
        }
        
        return `[${i + 1}] (${source})\n${parts.join('\n\n')}`;
      })
      .join('\n\n---\n\n');

    return context;
  }
}
