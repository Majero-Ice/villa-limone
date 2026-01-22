import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDocumentRepository, DOCUMENT_REPOSITORY } from '../../domain/repositories/document.repository.interface';
import { SupabaseStorageService } from '../../../../shared/infrastructure/storage/supabase-storage.service';

@Injectable()
export class DownloadDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async execute(id: string): Promise<{ content: string; fileName: string; contentType: string }> {
    const document = await this.documentRepository.findById(id);
    
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.storageUrl) {
      throw new NotFoundException('Document file not found in storage');
    }

    const content = await this.storageService.downloadFile(document.storageUrl);
    
    const extension = document.type === 'md' ? 'md' : document.type === 'txt' ? 'txt' : 'txt';
    const contentType = document.type === 'md' ? 'text/markdown' : 'text/plain';
    const fileName = document.name.endsWith(`.${extension}`) ? document.name : `${document.name}.${extension}`;

    return {
      content,
      fileName,
      contentType,
    };
  }
}
