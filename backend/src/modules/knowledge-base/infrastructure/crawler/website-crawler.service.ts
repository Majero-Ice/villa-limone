import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebsiteCrawlerService {
  private readonly logger = new Logger(WebsiteCrawlerService.name);

  async crawl(url: string): Promise<string> {
    this.logger.log(`Crawling website: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VillaLimoneBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }

      const html = await response.text();
      
      const text = this.extractTextFromHtml(html);
      
      return text;
    } catch (error) {
      this.logger.error(`Error crawling ${url}:`, error);
      throw error;
    }
  }

  private extractTextFromHtml(html: string): string {
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  }
}
