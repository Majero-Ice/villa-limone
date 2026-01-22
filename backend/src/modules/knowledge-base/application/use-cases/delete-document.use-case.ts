import { Injectable, Inject } from '@nestjs/common';
import { IDocumentRepository, DOCUMENT_REPOSITORY } from '../../domain/repositories/document.repository.interface';
import { CHUNK_REPOSITORY } from '../../../chat/domain/repositories/chunk.repository.interface';
import { IChunkRepository } from '../../../chat/domain/repositories/chunk.repository.interface';
import { SupabaseStorageService } from '../../../../shared/infrastructure/storage/supabase-storage.service';

@Injectable()
export class DeleteDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
    @Inject(CHUNK_REPOSITORY)
    private readonly chunkRepository: IChunkRepository,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async execute(id: string): Promise<void> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.storageUrl) {
      try {
        await this.storageService.deleteFile(document.storageUrl);
      } catch (error) {
        console.error(`Failed to delete file from storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    await this.chunkRepository.deleteByDocumentId(id);
    await this.documentRepository.delete(id);
  }
}
