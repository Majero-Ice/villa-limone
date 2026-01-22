export interface ConversationData {
  id: string;
  sessionId: string;
  hasReservation: boolean;
  messageCount: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  messages?: Array<{
    id: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    metadata?: any;
    createdAt: Date;
  }>;
}

export interface IConversationRepository {
  findBySessionId(sessionId: string): Promise<ConversationData | null>;
  create(sessionId: string): Promise<ConversationData>;
  updateContext(conversationId: string, context: any): Promise<void>;
  addMessage(conversationId: string, message: { role: 'USER' | 'ASSISTANT' | 'SYSTEM'; content: string; metadata?: any }): Promise<void>;
  findById(id: string): Promise<ConversationData | null>;
}

export const CONVERSATION_REPOSITORY = Symbol('IConversationRepository');
