import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../admin/infrastructure/guards/jwt-auth.guard';
import { GetAllDocumentsUseCase } from '../application/use-cases/get-all-documents.use-case';
import { UploadDocumentUseCase } from '../application/use-cases/upload-document.use-case';
import { DeleteDocumentUseCase } from '../application/use-cases/delete-document.use-case';
import { DownloadDocumentUseCase } from '../application/use-cases/download-document.use-case';
import { TriggerCrawlUseCase } from '../application/use-cases/trigger-crawl.use-case';
import { GetCrawlScheduleUseCase } from '../application/use-cases/get-crawl-schedule.use-case';
import { UpdateCrawlScheduleUseCase } from '../application/use-cases/update-crawl-schedule.use-case';
import { UploadDocumentDto } from '../application/dtos/upload-document.dto';
import { CrawlRequestDto } from '../application/dtos/crawl-request.dto';
import { CrawlScheduleDto } from '../application/dtos/crawl-schedule.dto';

@Controller('api/admin/documents')
@UseGuards(JwtAuthGuard)
export class AdminKnowledgeController {
  constructor(
    private readonly getAllDocuments: GetAllDocumentsUseCase,
    private readonly uploadDocument: UploadDocumentUseCase,
    private readonly deleteDocument: DeleteDocumentUseCase,
    private readonly downloadDocument: DownloadDocumentUseCase,
    private readonly triggerCrawl: TriggerCrawlUseCase,
    private readonly getCrawlSchedule: GetCrawlScheduleUseCase,
    private readonly updateCrawlSchedule: UpdateCrawlScheduleUseCase,
  ) {}

  @Get()
  getAll() {
    return this.getAllDocuments.execute();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: { sourceUrl?: string }) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const fileName = file.originalname;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    let type: 'pdf' | 'txt' | 'md';
    let content: string;

    if (fileExtension === 'txt') {
      type = 'txt';
      content = file.buffer.toString('utf-8');
    } else if (fileExtension === 'md' || fileExtension === 'markdown') {
      type = 'md';
      content = file.buffer.toString('utf-8');
    } else if (fileExtension === 'pdf') {
      throw new BadRequestException('PDF parsing not yet implemented. Please use text or markdown files.');
    } else {
      throw new BadRequestException(`Unsupported file type: ${fileExtension}`);
    }

    const dto: UploadDocumentDto = {
      name: fileName,
      type,
      content,
      sourceUrl: body.sourceUrl,
    };

    return this.uploadDocument.execute(dto);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { content, fileName, contentType } = await this.downloadDocument.execute(id);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(content);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteDocument.execute(id);
  }

  @Post('crawl')
  crawl(@Body() dto: CrawlRequestDto) {
    return this.triggerCrawl.execute(dto);
  }

  @Get('crawl/schedule')
  getSchedule() {
    return this.getCrawlSchedule.execute();
  }

  @Patch('crawl/schedule')
  updateSchedule(@Body() dto: CrawlScheduleDto) {
    return this.updateCrawlSchedule.execute(dto);
  }
}
