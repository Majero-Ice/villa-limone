import { Injectable, Inject } from '@nestjs/common';
import { BotSettingsDto } from '../dtos/bot-settings.dto';
import { UpdateBotSettingsDto } from '../dtos/bot-settings.dto';
import { IBotSettingsRepository, BOT_SETTINGS_REPOSITORY } from '../../domain/repositories/bot-settings.repository.interface';

@Injectable()
export class UpdateBotSettingsUseCase {
  constructor(
    @Inject(BOT_SETTINGS_REPOSITORY)
    private readonly botSettingsRepository: IBotSettingsRepository,
  ) {}

  async execute(dto: UpdateBotSettingsDto): Promise<BotSettingsDto> {
    const settings = await this.botSettingsRepository.update(dto);

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
