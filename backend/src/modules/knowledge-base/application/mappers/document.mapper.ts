import { Document } from '../../domain/entities/document.entity';
import { DocumentDto } from '../dtos/document.dto';

export class DocumentMapper {
  static toDto(document: Document, chunkCount?: number): DocumentDto {
    return {
      id: document.id,
      name: document.name,
      type: document.type,
      sourceUrl: document.sourceUrl,
      storageUrl: document.storageUrl,
      content: document.content,
      contentHash: document.contentHash,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      chunkCount,
    };
  }

  static toDomain(props: {
    id: string;
    name: string;
    type: string;
    sourceUrl?: string;
    storageUrl?: string;
    content?: string;
    contentHash?: string;
    createdAt: Date;
    updatedAt: Date;
  }): Document {
    return Document.create(props);
  }
}
