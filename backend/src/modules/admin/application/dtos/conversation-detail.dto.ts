export class MessageDto {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  metadata?: any;
  createdAt: Date;
}

export class ConversationDetailDto {
  id: string;
  sessionId: string;
  hasReservation: boolean;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  messages: MessageDto[];
}
