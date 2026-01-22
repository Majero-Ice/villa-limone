import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { IDocumentRepository, DOCUMENT_REPOSITORY } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';
import { UploadDocumentDto } from '../dtos/upload-document.dto';
import { TextParser } from '../../infrastructure/parsers/text.parser';
import { MarkdownParser } from '../../infrastructure/parsers/markdown.parser';
import { ChunkingService } from '../../infrastructure/services/chunking.service';
import { EmbeddingsService } from '../../../chat/application/services/embeddings.service';
import { CHUNK_REPOSITORY } from '../../../chat/domain/repositories/chunk.repository.interface';
import { IChunkRepository } from '../../../chat/domain/repositories/chunk.repository.interface';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { SupabaseStorageService } from '../../../../shared/infrastructure/storage/supabase-storage.service';

@Injectable()
export class UploadDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
    @Inject(CHUNK_REPOSITORY)
    private readonly chunkRepository: IChunkRepository,
    private readonly textParser: TextParser,
    private readonly markdownParser: MarkdownParser,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async execute(dto: UploadDocumentDto): Promise<{ id: string; chunksCreated: number }> {
    let parsedContent: string;

    switch (dto.type) {
      case 'txt':
        parsedContent = this.textParser.parse(dto.content);
        break;
      case 'md':
        parsedContent = this.markdownParser.parse(dto.content);
        break;
      default:
        throw new Error(`Unsupported document type: ${dto.type}`);
    }

    const contentHash = crypto.createHash('sha256').update(parsedContent).digest('hex');

    const existingDoc = await this.documentRepository.findByContentHash(contentHash);
    if (existingDoc) {
      throw new Error('Document with same content already exists');
    }

    const fileBuffer = Buffer.from(parsedContent, 'utf-8');
    const contentType = dto.type === 'md' ? 'text/markdown' : 'text/plain';
    const storageUrl = await this.storageService.uploadFile(dto.name, fileBuffer, contentType);

    const document = Document.create({
      id: crypto.randomUUID(),
      name: dto.name,
      type: dto.type,
      sourceUrl: dto.sourceUrl,
      storageUrl,
      content: undefined,
      contentHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedDocument = await this.documentRepository.create(document);

    const chunks = this.chunkingService.chunkText(parsedContent);
    
    if (chunks.length > 0) {
      const embeddings = await this.embeddingsService.createEmbeddings(chunks);
      
      const chunkData = chunks.map((chunk, index) => ({
        documentId: savedDocument.id,
        content: chunk,
        embedding: embeddings[index],
        metadata: { chunkIndex: index, fileName: dto.name },
      }));

      await this.chunkRepository.insertMany(chunkData);
    }

    return {
      id: savedDocument.id,
      chunksCreated: chunks.length,
    };
  }
}
