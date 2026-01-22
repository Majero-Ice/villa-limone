import { IsString, IsUrl } from 'class-validator';

export class CrawlRequestDto {
  @IsString()
  @IsUrl()
  sourceUrl: string;
}
