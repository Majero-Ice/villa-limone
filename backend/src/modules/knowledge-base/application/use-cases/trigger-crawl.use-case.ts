import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { IDocumentRepository, DOCUMENT_REPOSITORY } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';
import { CrawlRequestDto } from '../dtos/crawl-request.dto';
import { WebsiteCrawlerService } from '../../infrastructure/crawler/website-crawler.service';
import { ChunkingService } from '../../infrastructure/services/chunking.service';
import { EmbeddingsService } from '../../../chat/application/services/embeddings.service';
import { CHUNK_REPOSITORY } from '../../../chat/domain/repositories/chunk.repository.interface';
import { IChunkRepository } from '../../../chat/domain/repositories/chunk.repository.interface';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { SupabaseStorageService } from '../../../../shared/infrastructure/storage/supabase-storage.service';

@Injectable()
export class TriggerCrawlUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
    @Inject(CHUNK_REPOSITORY)
    private readonly chunkRepository: IChunkRepository,
    private readonly crawlerService: WebsiteCrawlerService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async execute(dto: CrawlRequestDto): Promise<{ logId: string }> {
    const log = await this.prisma.crawlLog.create({
      data: {
        id: crypto.randomUUID(),
        status: 'RUNNING',
        sourceUrl: dto.sourceUrl,
        documentsUpdated: 0,
        chunksCreated: 0,
      },
    });

    try {
      const content = await this.crawlerService.crawl(dto.sourceUrl);
      const contentHash = crypto.createHash('sha256').update(content).digest('hex');

      const existingDoc = await this.documentRepository.findByContentHash(contentHash);
      
      let document: Document;
      let chunksCreated = 0;

      const fileName = `crawl-${new URL(dto.sourceUrl).hostname}-${Date.now()}.txt`;
      const fileBuffer = Buffer.from(content, 'utf-8');
      const storageUrl = await this.storageService.uploadFile(fileName, fileBuffer, 'text/plain');

      if (existingDoc) {
        if (existingDoc.storageUrl) {
          try {
            await this.storageService.deleteFile(existingDoc.storageUrl);
          } catch (error) {
            console.error(`Failed to delete old file from storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        await this.chunkRepository.deleteByDocumentId(existingDoc.id);
        
        document = Document.create({
          id: existingDoc.id,
          name: existingDoc.name,
          type: existingDoc.type,
          sourceUrl: existingDoc.sourceUrl,
          storageUrl,
          content: undefined,
          contentHash: existingDoc.contentHash,
          createdAt: existingDoc.createdAt,
          updatedAt: new Date(),
        });
        
        await this.prisma.document.update({
          where: { id: existingDoc.id },
          data: { storageUrl, content: null, updatedAt: new Date() },
        });
      } else {
        document = Document.create({
          id: crypto.randomUUID(),
          name: `Crawl: ${new URL(dto.sourceUrl).hostname}`,
          type: 'crawl',
          sourceUrl: dto.sourceUrl,
          storageUrl,
          content: undefined,
          contentHash,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const savedDocument = await this.documentRepository.create(document);
        document = savedDocument;
      }

      const chunkData = this.chunkingService.chunkText(content);
      
      if (chunkData.length > 0) {
        const contentOnly = chunkData.map(chunk => chunk.content);
        const embeddings = await this.embeddingsService.createEmbeddings(contentOnly);
        
        const chunks = chunkData.map((chunk, index) => ({
          documentId: document.id,
          content: chunk.content,
          embedding: embeddings[index],
          metadata: {
            chunkIndex: index,
            sourceUrl: dto.sourceUrl,
            contextBefore: chunk.contextBefore,
            contextAfter: chunk.contextAfter,
          },
        }));

        await this.chunkRepository.insertMany(chunks);
        chunksCreated = chunkData.length;
      }

      await this.prisma.crawlLog.update({
        where: { id: log.id },
        data: {
          status: 'COMPLETED',
          documentsUpdated: existingDoc ? 1 : 0,
          chunksCreated,
          completedAt: new Date(),
        },
      });

      return { logId: log.id };
    } catch (error) {
      await this.prisma.crawlLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }
}
