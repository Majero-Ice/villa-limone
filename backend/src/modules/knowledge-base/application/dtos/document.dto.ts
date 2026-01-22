export class DocumentDto {
  id: string;
  name: string;
  type: string;
  sourceUrl?: string;
  storageUrl?: string;
  content?: string;
  contentHash?: string;
  createdAt: Date;
  updatedAt: Date;
  chunkCount?: number;
}
