export interface BotSettings {
  id: string;
  systemPrompt: string;
  enableBooking: boolean;
  enableRecommendations: boolean;
  enableAvailability: boolean;
  updatedAt: string;
}

export interface UpdateBotSettingsRequest {
  systemPrompt?: string;
  enableBooking?: boolean;
  enableRecommendations?: boolean;
  enableAvailability?: boolean;
}
