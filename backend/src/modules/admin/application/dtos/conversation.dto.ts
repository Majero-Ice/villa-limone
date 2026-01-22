export class ConversationDto {
  id: string;
  sessionId: string;
  hasReservation: boolean;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  firstMessage?: string;
}
