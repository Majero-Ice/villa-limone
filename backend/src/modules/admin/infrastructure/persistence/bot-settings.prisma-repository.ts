import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IBotSettingsRepository, BotSettingsData } from '../../domain/repositories/bot-settings.repository.interface';

@Injectable()
export class BotSettingsPrismaRepository implements IBotSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(): Promise<BotSettingsData | null> {
    const record = await this.prisma.botSettings.findUnique({
      where: { id: 'default' },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      systemPrompt: record.systemPrompt,
      enableBooking: record.enableBooking,
      enableRecommendations: record.enableRecommendations,
      enableAvailability: record.enableAvailability,
      updatedAt: record.updatedAt,
    };
  }

  async update(data: Partial<Omit<BotSettingsData, 'id' | 'updatedAt'>>): Promise<BotSettingsData> {
    const record = await this.prisma.botSettings.upsert({
      where: { id: 'default' },
      update: {
        systemPrompt: data.systemPrompt,
        enableBooking: data.enableBooking,
        enableRecommendations: data.enableRecommendations,
        enableAvailability: data.enableAvailability,
      },
      create: {
        id: 'default',
        systemPrompt: data.systemPrompt || '',
        enableBooking: data.enableBooking ?? true,
        enableRecommendations: data.enableRecommendations ?? true,
        enableAvailability: data.enableAvailability ?? true,
      },
    });

    return {
      id: record.id,
      systemPrompt: record.systemPrompt,
      enableBooking: record.enableBooking,
      enableRecommendations: record.enableRecommendations,
      enableAvailability: record.enableAvailability,
      updatedAt: record.updatedAt,
    };
  }
}
