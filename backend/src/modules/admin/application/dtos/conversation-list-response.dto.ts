import { ConversationDto } from './conversation.dto';

export class ConversationListResponseDto {
  conversations: ConversationDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
