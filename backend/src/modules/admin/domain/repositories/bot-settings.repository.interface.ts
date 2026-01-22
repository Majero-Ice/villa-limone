export interface BotSettingsData {
  id: string;
  systemPrompt: string;
  enableBooking: boolean;
  enableRecommendations: boolean;
  enableAvailability: boolean;
  updatedAt: Date;
}

export interface IBotSettingsRepository {
  find(): Promise<BotSettingsData | null>;
  update(data: Partial<Omit<BotSettingsData, 'id' | 'updatedAt'>>): Promise<BotSettingsData>;
}

export const BOT_SETTINGS_REPOSITORY = Symbol('IBotSettingsRepository');
