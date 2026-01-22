import { api } from '@/shared/lib/api';
import { LoginRequest, AuthResponse, Admin } from '../model/types';

export const adminApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/admin/auth/login', credentials);
    return response.data;
  },

  getMe: async (): Promise<Admin> => {
    const response = await api.get<Admin>('/api/admin/auth/me');
    return response.data;
  },
};
