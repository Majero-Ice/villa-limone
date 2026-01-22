import { Injectable, Inject } from '@nestjs/common';
import { IDocumentRepository, DOCUMENT_REPOSITORY } from '../../domain/repositories/document.repository.interface';
import { DocumentDto } from '../dtos/document.dto';
import { DocumentMapper } from '../mappers/document.mapper';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class GetAllDocumentsUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(): Promise<DocumentDto[]> {
    const documents = await this.documentRepository.findAll();
    
    const documentsWithChunkCount = await Promise.all(
      documents.map(async (doc) => {
        const chunkCount = await this.prisma.chunk.count({
          where: { documentId: doc.id },
        });
        return DocumentMapper.toDto(doc, chunkCount);
      }),
    );

    return documentsWithChunkCount;
  }
}
