import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TriggerCrawlUseCase } from '../../application/use-cases/trigger-crawl.use-case';
import { CrawlRequestDto } from '../../application/dtos/crawl-request.dto';

@Injectable()
export class CrawlSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(CrawlSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly triggerCrawl: TriggerCrawlUseCase,
  ) {}

  async onModuleInit() {
    await this.scheduleNextRun();
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyCrawl() {
    await this.executeScheduledCrawl('daily');
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyCrawl() {
    await this.executeScheduledCrawl('weekly');
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyCrawl() {
    await this.executeScheduledCrawl('monthly');
  }

  private async executeScheduledCrawl(frequency: string) {
    const schedule = await this.prisma.crawlSchedule.findUnique({
      where: { id: 'default' },
    });

    if (!schedule || !schedule.enabled || schedule.frequency !== frequency || !schedule.sourceUrl) {
      return;
    }

    this.logger.log(`Executing scheduled ${frequency} crawl for ${schedule.sourceUrl}`);

    try {
      const dto: CrawlRequestDto = {
        sourceUrl: schedule.sourceUrl,
      };

      await this.triggerCrawl.execute(dto);

      await this.prisma.crawlSchedule.update({
        where: { id: 'default' },
        data: {
          lastRun: new Date(),
          nextRun: this.calculateNextRun(schedule.frequency),
        },
      });

      this.logger.log(`Scheduled crawl completed successfully`);
    } catch (error) {
      this.logger.error(`Scheduled crawl failed:`, error);
    }
  }

  async scheduleNextRun() {
    const schedule = await this.prisma.crawlSchedule.findUnique({
      where: { id: 'default' },
    });

    if (!schedule || !schedule.enabled || !schedule.sourceUrl) {
      return;
    }

    const nextRun = this.calculateNextRun(schedule.frequency);

    await this.prisma.crawlSchedule.update({
      where: { id: 'default' },
      data: { nextRun },
    });
  }

  private calculateNextRun(frequency: string): Date {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        next.setHours(2, 0, 0, 0);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        next.setHours(2, 0, 0, 0);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
        next.setHours(2, 0, 0, 0);
        break;
      default:
        next.setDate(next.getDate() + 1);
    }

    return next;
  }
}
