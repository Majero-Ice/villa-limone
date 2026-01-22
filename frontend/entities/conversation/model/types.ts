export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Conversation {
  id: string;
  sessionId: string;
  hasReservation: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  firstMessage?: string;
}

export interface ConversationDetail {
  id: string;
  sessionId: string;
  hasReservation: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface ConversationListQuery {
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'messageCount';
  order?: 'asc' | 'desc';
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
