import { Injectable, Logger } from '@nestjs/common';

export interface ChunkData {
  content: string;
  contextBefore?: string;
  contextAfter?: string;
}

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);

  chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 150): ChunkData[] {
    const chunks: ChunkData[] = [];
    
    const normalizedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const sections = this.splitIntoSections(normalizedText);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      const prevSection = i > 0 ? sections[i - 1].trim() : null;
      const nextSection = i < sections.length - 1 ? sections[i + 1].trim() : null;
      
      if (section.length <= maxChunkSize) {
        if (section.length >= 150) {
          chunks.push({
            content: section,
            contextBefore: prevSection ? this.truncateContext(prevSection, 200) : undefined,
            contextAfter: nextSection ? this.truncateContext(nextSection, 200) : undefined,
          });
        }
        continue;
      }

      const sectionChunks = this.splitSectionIntoChunks(section, maxChunkSize, overlap);
      for (let j = 0; j < sectionChunks.length; j++) {
        const chunk = sectionChunks[j].trim();
        if (chunk.length < 150) continue;
        
        const prevChunk = j > 0 ? sectionChunks[j - 1].trim() : null;
        const nextChunk = j < sectionChunks.length - 1 ? sectionChunks[j + 1].trim() : null;
        
        chunks.push({
          content: chunk,
          contextBefore: prevChunk ? this.truncateContext(prevChunk, 200) : undefined,
          contextAfter: nextChunk ? this.truncateContext(nextChunk, 200) : undefined,
        });
      }
    }

    this.logger.debug(
      `[chunkText] Created ${chunks.length} chunks (avg content length: ${Math.round(chunks.reduce((sum, c) => sum + c.content.length, 0) / chunks.length || 0)})`,
    );
    
    return chunks;
  }

  private truncateContext(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    const sentences = this.splitIntoSentences(text);
    let snippet = '';
    
    for (const sentence of sentences) {
      if (snippet.length + sentence.length + 1 > maxLength) {
        break;
      }
      snippet += (snippet ? ' ' : '') + sentence;
    }
    
    if (!snippet && sentences.length > 0) {
      snippet = sentences[0].substring(0, maxLength);
    }
    
    return snippet.trim();
  }

  private extractContextSnippet(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    const sentences = this.splitIntoSentences(text);
    let snippet = '';
    
    for (const sentence of sentences) {
      if (snippet.length + sentence.length + 1 > maxLength) {
        break;
      }
      snippet += (snippet ? ' ' : '') + sentence;
    }
    
    if (!snippet && sentences.length > 0) {
      snippet = sentences[0].substring(0, maxLength);
    }
    
    return snippet.trim();
  }

  private splitIntoSections(text: string): string[] {
    const sections: string[] = [];
    const sectionMarkers = [
      /^#{1,3}\s+.+$/gm,
      /^##\s+.+$/gm,
      /^###\s+.+$/gm,
    ];

    let lastIndex = 0;
    const matches: Array<{ index: number; text: string }> = [];

    for (const marker of sectionMarkers) {
      let match;
      while ((match = marker.exec(text)) !== null) {
        matches.push({ index: match.index, text: match[0] });
      }
    }

    matches.sort((a, b) => a.index - b.index);

    for (const match of matches) {
      if (match.index > lastIndex) {
        const section = text.substring(lastIndex, match.index).trim();
        if (section.length > 0) {
          sections.push(section);
        }
        lastIndex = match.index;
      }
    }

    if (lastIndex < text.length) {
      const section = text.substring(lastIndex).trim();
      if (section.length > 0) {
        sections.push(section);
      }
    }

    return sections.length > 0 ? sections : [text];
  }

  private splitSectionIntoChunks(section: string, maxChunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    
    const paragraphs = section.split(/\n\n+/).filter(p => p.trim().length > 0);
    let currentChunk = '';
    
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim();
      
      if ((currentChunk + '\n\n' + para).length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        
        const overlapText = this.getOverlapText(currentChunk, overlap);
        currentChunk = overlapText + '\n\n' + para;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + para;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  private getOverlapText(text: string, overlapSize: number): string {
    if (text.length <= overlapSize) {
      return text;
    }
    
    const overlapText = text.slice(-overlapSize);
    const lastParaIndex = overlapText.lastIndexOf('\n\n');
    
    if (lastParaIndex > overlapSize * 0.3) {
      return overlapText.substring(lastParaIndex + 2).trim();
    }
    
    const sentences = this.splitIntoSentences(overlapText);
    return sentences.slice(-2).join(' ').trim();
  }

  private splitIntoSentences(text: string): string[] {
    const sentenceEndings = /([.!?]+\s+|\.\n+)/g;
    const sentences: string[] = [];
    let lastIndex = 0;
    let match;

    while ((match = sentenceEndings.exec(text)) !== null) {
      const sentence = text.substring(lastIndex, match.index + match[0].length).trim();
      if (sentence.length > 10) {
        sentences.push(sentence);
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      const sentence = text.substring(lastIndex).trim();
      if (sentence.length > 10) {
        sentences.push(sentence);
      }
    }

    return sentences.length > 0 ? sentences : [text];
  }

  private getOverlapSentences(text: string, overlapSize: number): string {
    if (text.length <= overlapSize) {
      return text;
    }

    const overlapText = text.slice(-overlapSize);
    const lastSentenceIndex = overlapText.lastIndexOf('.');
    
    if (lastSentenceIndex > overlapSize * 0.3) {
      return overlapText.substring(lastSentenceIndex + 1).trim();
    }

    const words = overlapText.split(/\s+/);
    return words.slice(-Math.floor(overlapSize / 10)).join(' ');
  }
}
