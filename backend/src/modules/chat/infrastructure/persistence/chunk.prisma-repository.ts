import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  IChunkRepository,
  SimilaritySearchResult,
  FindSimilarChunksOptions,
} from '../../domain/repositories/chunk.repository.interface';

@Injectable()
export class ChunkPrismaRepository implements IChunkRepository {
  private readonly logger = new Logger(ChunkPrismaRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findSimilarByEmbedding(
    embedding: number[],
    options: FindSimilarChunksOptions = {},
  ): Promise<SimilaritySearchResult[]> {
    const { limit = 5, threshold = 0.3 } = options;

    this.logger.debug(`[findSimilarByEmbedding] Searching with limit=${limit}, threshold=${threshold}`);
    this.logger.debug(`[findSimilarByEmbedding] Embedding vector length: ${embedding.length}`);

    const embeddingStr = `[${embedding.join(',')}]`;

    const startTime = Date.now();
    
    const searchLimit = Math.max(limit * 2, 10);
    
    const results = await this.prisma.$queryRawUnsafe<Array<{
      id: string;
      document_id: string;
      content: string;
      metadata: any;
      similarity: number;
      content_length: number;
    }>>(
      `
  SELECT 
    id,
    "documentId" as document_id,
    content,
    metadata,
    1 - (embedding <=> $1::vector) as similarity,
    LENGTH(content) as content_length
  FROM "Chunk"
  WHERE embedding IS NOT NULL
    AND LENGTH(content) > 50
    -- AND 1 - (embedding <=> $1::vector) > $2  -- ЗАКОММЕНТИРУЙ ЭТО
  ORDER BY embedding <=> $1::vector
  LIMIT $2  -- было $3
  `,
  embeddingStr,
  searchLimit,  // убрали threshold из параметров
);

this.logger.log('RAW RESULTS:', results.map(r => ({
  sim: r.similarity.toFixed(4),
  preview: r.content.slice(0, 50)
})));
    const queryTime = Date.now() - startTime;
    
    const filteredResults = results
      .filter((r) => r.content_length > 50)
      .slice(0, limit);

    this.logger.log(`[findSimilarByEmbedding] Query executed in ${queryTime}ms, found ${results.length} results (filtered to ${filteredResults.length})`);
    
    if (filteredResults.length > 0) {
      this.logger.debug(`[findSimilarByEmbedding] Similarity scores: ${filteredResults.map(r => r.similarity.toFixed(4)).join(', ')}`);
      this.logger.debug(`[findSimilarByEmbedding] Content lengths: ${filteredResults.map(r => r.content_length).join(', ')}`);
    } else {
      this.logger.warn(`[findSimilarByEmbedding] No results found with threshold ${threshold}. Total chunks in DB may be 0 or threshold too high.`);
    }

    return filteredResults.map((row) => ({
      chunk: {
        id: row.id,
        documentId: row.document_id,
        content: row.content,
        metadata: row.metadata,
      },
      similarity: row.similarity,
    }));
  }

  async insertChunk(
    documentId: string,
    content: string,
    embedding: number[],
    metadata?: any,
  ): Promise<string> {
    const embeddingStr = `[${embedding.join(',')}]`;

    const result = await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO "Chunk" (id, "documentId", content, embedding, metadata, "createdAt")
      VALUES (gen_random_uuid(), $1, $2, $3::vector, $4, NOW())
      RETURNING id
      `,
      documentId,
      content,
      embeddingStr,
      metadata ? JSON.stringify(metadata) : null,
    );

    return result as any;
  }

  async insertMany(
    chunks: Array<{ documentId: string; content: string; embedding: number[]; metadata?: any }>,
  ): Promise<number> {
    if (chunks.length === 0) {
      return 0;
    }

    const values = chunks
      .map(
        (chunk, index) =>
          `(gen_random_uuid(), $${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}::vector, $${index * 4 + 4})`,
      )
      .join(',');

    const params = chunks.flatMap((chunk) => [
      chunk.documentId,
      chunk.content,
      `[${chunk.embedding.join(',')}]`,
      chunk.metadata ? JSON.stringify(chunk.metadata) : null,
    ]);

    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO "Chunk" (id, "documentId", content, embedding, metadata)
      VALUES ${values}
      `,
      ...params,
    );

    return chunks.length;
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.prisma.chunk.deleteMany({
      where: { documentId },
    });
  }
}
