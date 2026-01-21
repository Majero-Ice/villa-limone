import { api } from '@/shared/lib/api';
import { Room } from '../model/types';

export const roomApi = {
  getAll: async (): Promise<Room[]> => {
    const response = await api.get<Room[]>('/api/rooms');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Room> => {
    const response = await api.get<Room>(`/api/rooms/${slug}`);
    return response.data;
  },
};
