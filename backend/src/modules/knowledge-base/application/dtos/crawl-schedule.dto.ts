import { IsBoolean, IsString, IsOptional, IsIn, IsUrl, IsDate } from 'class-validator';

export class CrawlScheduleDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsIn(['daily', 'weekly', 'monthly'])
  frequency: 'daily' | 'weekly' | 'monthly';

  @IsString()
  @IsUrl()
  sourceUrl: string;

  @IsOptional()
  @IsDate()
  lastRun?: Date;

  @IsOptional()
  @IsDate()
  nextRun?: Date;
}
