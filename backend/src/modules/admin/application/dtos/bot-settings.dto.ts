import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class BotSettingsDto {
  id: string;
  systemPrompt: string;
  enableBooking: boolean;
  enableRecommendations: boolean;
  enableAvailability: boolean;
  updatedAt: Date;
}

export class UpdateBotSettingsDto {
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @IsOptional()
  @IsBoolean()
  enableBooking?: boolean;

  @IsOptional()
  @IsBoolean()
  enableRecommendations?: boolean;

  @IsOptional()
  @IsBoolean()
  enableAvailability?: boolean;
}
