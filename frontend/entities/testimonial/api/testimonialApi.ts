import { api } from '@/shared/lib/api';
import { Testimonial } from '../model/types';

export const testimonialApi = {
  getAll: async (): Promise<Testimonial[]> => {
    const response = await api.get<Testimonial[]>('/api/testimonials');
    return response.data;
  },
};
