import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { CrawlScheduleDto } from '../dtos/crawl-schedule.dto';

@Injectable()
export class UpdateCrawlScheduleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CrawlScheduleDto): Promise<CrawlScheduleDto> {
    const schedule = await this.prisma.crawlSchedule.upsert({
      where: { id: 'default' },
      update: {
        enabled: dto.enabled,
        frequency: dto.frequency,
        sourceUrl: dto.sourceUrl,
        nextRun: dto.nextRun,
      },
      create: {
        id: 'default',
        enabled: dto.enabled,
        frequency: dto.frequency,
        sourceUrl: dto.sourceUrl,
        nextRun: dto.nextRun,
      },
    });

    return {
      enabled: schedule.enabled,
      frequency: schedule.frequency as 'daily' | 'weekly' | 'monthly',
      sourceUrl: schedule.sourceUrl,
      lastRun: schedule.lastRun || undefined,
      nextRun: schedule.nextRun || undefined,
    };
  }
}
