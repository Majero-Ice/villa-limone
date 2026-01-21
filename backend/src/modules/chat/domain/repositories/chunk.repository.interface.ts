export interface SimilaritySearchResult {
  chunk: {
    id: string;
    documentId: string;
    content: string;
    metadata: any;
  };
  similarity: number;
}

export interface FindSimilarChunksOptions {
  limit?: number;
  threshold?: number;
}

export interface IChunkRepository {
  findSimilarByEmbedding(
    embedding: number[],
    options?: FindSimilarChunksOptions,
  ): Promise<SimilaritySearchResult[]>;

  insertChunk(documentId: string, content: string, embedding: number[], metadata?: any): Promise<string>;

  insertMany(chunks: Array<{ documentId: string; content: string; embedding: number[]; metadata?: any }>): Promise<number>;

  deleteByDocumentId(documentId: string): Promise<void>;
}

export const CHUNK_REPOSITORY = Symbol('IChunkRepository');
