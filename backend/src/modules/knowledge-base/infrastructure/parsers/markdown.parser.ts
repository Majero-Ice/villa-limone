import { Injectable } from '@nestjs/common';

@Injectable()
export class MarkdownParser {
  parse(content: string): string {
    return content.trim();
  }
}
