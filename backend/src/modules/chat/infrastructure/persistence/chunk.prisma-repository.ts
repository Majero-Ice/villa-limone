import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  IChunkRepository,
  SimilaritySearchResult,
  FindSimilarChunksOptions,
} from '../../domain/repositories/chunk.repository.interface';

@Injectable()
export class ChunkPrismaRepository implements IChunkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSimilarByEmbedding(
    embedding: number[],
    options: FindSimilarChunksOptions = {},
  ): Promise<SimilaritySearchResult[]> {
    const { limit = 5, threshold = 0.3 } = options;

    const embeddingStr = `[${embedding.join(',')}]`;

    const results = await this.prisma.$queryRawUnsafe<Array<{
      id: string;
      document_id: string;
      content: string;
      metadata: any;
      similarity: number;
    }>>(
      `
      SELECT 
        id,
        "documentId" as document_id,
        content,
        metadata,
        1 - (embedding <=> $1::vector) as similarity
      FROM "Chunk"
      WHERE embedding IS NOT NULL
        AND 1 - (embedding <=> $1::vector) > $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3
      `,
      embeddingStr,
      threshold,
      limit,
    );

    return results.map((row) => ({
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
