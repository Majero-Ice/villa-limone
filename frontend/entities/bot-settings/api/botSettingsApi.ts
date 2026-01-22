import { api } from '@/shared/lib/api';
import { BotSettings, UpdateBotSettingsRequest } from '../model/types';

export const botSettingsApi = {
  get: async (): Promise<BotSettings> => {
    const response = await api.get<BotSettings>('/api/admin/settings');
    return response.data;
  },

  update: async (data: UpdateBotSettingsRequest): Promise<BotSettings> => {
    const response = await api.patch<BotSettings>('/api/admin/settings', data);
    return response.data;
  },
};
