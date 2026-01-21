export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateMessageDto {
  content: string;
  sessionId: string;
}

export interface SendMessageResponse {
  message: Message;
  reply: Message;
}
