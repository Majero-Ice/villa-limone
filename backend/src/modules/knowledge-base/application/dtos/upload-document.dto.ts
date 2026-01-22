export class UploadDocumentDto {
  name: string;
  type: 'pdf' | 'txt' | 'md';
  content: string;
  sourceUrl?: string;
}
