import { Document } from '../entities/document.entity';

export interface IDocumentRepository {
  findAll(): Promise<Document[]>;
  findById(id: string): Promise<Document | null>;
  create(document: Document): Promise<Document>;
  delete(id: string): Promise<void>;
  findByContentHash(contentHash: string): Promise<Document | null>;
}

export const DOCUMENT_REPOSITORY = Symbol('IDocumentRepository');
