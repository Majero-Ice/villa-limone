import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BotSettingsDto } from '../dtos/bot-settings.dto';
import { IBotSettingsRepository, BOT_SETTINGS_REPOSITORY } from '../../domain/repositories/bot-settings.repository.interface';

@Injectable()
export class GetBotSettingsUseCase {
  constructor(
    @Inject(BOT_SETTINGS_REPOSITORY)
    private readonly botSettingsRepository: IBotSettingsRepository,
  ) {}

  async execute(): Promise<BotSettingsDto> {
    const settings = await this.botSettingsRepository.find();

    if (!settings) {
      throw new NotFoundException('Bot settings not found');
    }

    return {
      id: settings.id,
      systemPrompt: settings.systemPrompt,
      enableBooking: settings.enableBooking,
      enableRecommendations: settings.enableRecommendations,
      enableAvailability: settings.enableAvailability,
      updatedAt: settings.updatedAt,
    };
  }
}
