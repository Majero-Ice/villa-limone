import { Injectable } from '@nestjs/common';

@Injectable()
export class TextParser {
  parse(content: string): string {
    return content.trim();
  }
}
