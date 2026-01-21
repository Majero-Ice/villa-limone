import { api } from '@/shared/lib/api';

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequestDto {
  message: string;
  sessionId?: string;
  history?: ChatMessage[];
  maxContextChunks?: number;
  similarityThreshold?: number;
}

export interface ChatSource {
  chunkId: string;
  content: string;
  similarity: number;
}

export interface ChatResponseDto {
  message: string;
  sources: ChatSource[];
  model: string;
}

export const chatApi = {
  sendMessage: async (request: ChatRequestDto): Promise<ChatResponseDto> => {
    const response = await api.post<ChatResponseDto>('/api/chat/message', request);
    return response.data;
  },
};
