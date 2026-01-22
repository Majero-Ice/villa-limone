export interface DocumentProps {
  id: string;
  name: string;
  type: string;
  sourceUrl?: string;
  storageUrl?: string;
  content?: string;
  contentHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Document {
  private constructor(private readonly props: DocumentProps) {}

  static create(props: DocumentProps): Document {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Document name is required');
    }
    if (!props.type || !['pdf', 'txt', 'md', 'crawl'].includes(props.type)) {
      throw new Error('Invalid document type');
    }
    if (!props.storageUrl && (!props.content || props.content.trim().length === 0)) {
      throw new Error('Document must have either storageUrl or content');
    }
    return new Document(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): string {
    return this.props.type;
  }

  get sourceUrl(): string | undefined {
    return this.props.sourceUrl;
  }

  get storageUrl(): string | undefined {
    return this.props.storageUrl;
  }

  get content(): string | undefined {
    return this.props.content;
  }

  get contentHash(): string | undefined {
    return this.props.contentHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
