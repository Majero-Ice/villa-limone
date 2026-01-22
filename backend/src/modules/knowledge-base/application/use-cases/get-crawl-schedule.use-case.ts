import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { CrawlScheduleDto } from '../dtos/crawl-schedule.dto';

@Injectable()
export class GetCrawlScheduleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CrawlScheduleDto> {
    let schedule = await this.prisma.crawlSchedule.findUnique({
      where: { id: 'default' },
    });

    if (!schedule) {
      schedule = await this.prisma.crawlSchedule.create({
        data: {
          id: 'default',
          enabled: false,
          frequency: 'daily',
          sourceUrl: '',
        },
      });
    }

    return {
      enabled: schedule.enabled,
      frequency: schedule.frequency as 'daily' | 'weekly' | 'monthly',
      sourceUrl: schedule.sourceUrl,
      lastRun: schedule.lastRun || undefined,
      nextRun: schedule.nextRun || undefined,
    };
  }
}
