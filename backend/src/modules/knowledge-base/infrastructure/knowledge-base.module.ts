import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../../shared/infrastructure/prisma/prisma.module';
import { ChatModule } from '../../chat/infrastructure/chat.module';
import { AdminKnowledgeController } from '../presentation/admin-knowledge.controller';
import { DocumentPrismaRepository } from './persistence/document.prisma-repository';
import { DOCUMENT_REPOSITORY } from '../domain/repositories/document.repository.interface';
import { GetAllDocumentsUseCase } from '../application/use-cases/get-all-documents.use-case';
import { UploadDocumentUseCase } from '../application/use-cases/upload-document.use-case';
import { DeleteDocumentUseCase } from '../application/use-cases/delete-document.use-case';
import { DownloadDocumentUseCase } from '../application/use-cases/download-document.use-case';
import { TriggerCrawlUseCase } from '../application/use-cases/trigger-crawl.use-case';
import { GetCrawlScheduleUseCase } from '../application/use-cases/get-crawl-schedule.use-case';
import { UpdateCrawlScheduleUseCase } from '../application/use-cases/update-crawl-schedule.use-case';
import { TextParser } from './parsers/text.parser';
import { MarkdownParser } from './parsers/markdown.parser';
import { PdfParser } from './parsers/pdf.parser';
import { ChunkingService } from './services/chunking.service';
import { WebsiteCrawlerService } from './crawler/website-crawler.service';
import { CrawlSchedulerService } from './services/crawl-scheduler.service';
import { SupabaseStorageService } from '../../../shared/infrastructure/storage/supabase-storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ChatModule, ScheduleModule.forRoot(), ConfigModule],
  controllers: [AdminKnowledgeController],
  providers: [
    {
      provide: DOCUMENT_REPOSITORY,
      useClass: DocumentPrismaRepository,
    },
    GetAllDocumentsUseCase,
    UploadDocumentUseCase,
    DeleteDocumentUseCase,
    DownloadDocumentUseCase,
    TriggerCrawlUseCase,
    GetCrawlScheduleUseCase,
    UpdateCrawlScheduleUseCase,
    TextParser,
    MarkdownParser,
    PdfParser,
    ChunkingService,
    WebsiteCrawlerService,
    CrawlSchedulerService,
    SupabaseStorageService,
  ],
  exports: [DOCUMENT_REPOSITORY],
})
export class KnowledgeBaseModule {}
