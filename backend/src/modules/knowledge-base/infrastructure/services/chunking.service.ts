import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkingService {
  chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
    const paragraphs = text.split('\n\n');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length + 2 > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        const overlapText = currentChunk.slice(-overlap);
        currentChunk = overlapText + '\n\n' + paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter((chunk) => chunk.length > 50);
  }
}
