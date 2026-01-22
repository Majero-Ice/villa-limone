import { api } from '@/shared/lib/api';
import {
  QuickReply,
  CreateQuickReplyRequest,
  UpdateQuickReplyRequest,
} from '../model/types';

export const quickReplyApi = {
  getAll: async (): Promise<QuickReply[]> => {
    const response = await api.get<QuickReply[]>('/api/admin/quick-replies');
    return response.data;
  },

  create: async (data: CreateQuickReplyRequest): Promise<QuickReply> => {
    const response = await api.post<QuickReply>('/api/admin/quick-replies', data);
    return response.data;
  },

  update: async (id: string, data: UpdateQuickReplyRequest): Promise<QuickReply> => {
    const response = await api.patch<QuickReply>(`/api/admin/quick-replies/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/quick-replies/${id}`);
  },
};
