import { api } from '@/shared/lib/api';
import { Amenity } from '../model/types';

export const amenityApi = {
  getAll: async (): Promise<Amenity[]> => {
    const response = await api.get<Amenity[]>('/api/amenities');
    return response.data;
  },
};
