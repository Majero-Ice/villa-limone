import { api } from '@/shared/lib/api';
import {
  Conversation,
  ConversationDetail,
  ConversationListQuery,
  ConversationListResponse,
} from '../model/types';

export const conversationApi = {
  getAll: async (query?: ConversationListQuery): Promise<ConversationListResponse> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.orderBy) params.append('orderBy', query.orderBy);
    if (query?.order) params.append('order', query.order);

    const response = await api.get<ConversationListResponse>(
      `/api/admin/conversations?${params.toString()}`,
    );
    return response.data;
  },

  getById: async (id: string): Promise<ConversationDetail> => {
    const response = await api.get<ConversationDetail>(`/api/admin/conversations/${id}`);
    return response.data;
  },
};
