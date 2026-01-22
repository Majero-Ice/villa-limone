export interface ChatResponseDto {
  message: string;
  sources: Array<{
    chunkId: string;
    content: string;
    similarity: number;
  }>;
  model: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
  reservationId?: string;
}
