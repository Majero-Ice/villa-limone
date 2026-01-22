import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfParser {
  async parse(buffer: Buffer): Promise<string> {
    throw new Error('PDF parsing not yet implemented. Please use text or markdown files.');
  }
}
