export class ConversationListQueryDto {
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'messageCount';
  order?: 'asc' | 'desc';
}
