export interface QuickReplyData {
  id: string;
  trigger: string;
  response: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface IQuickReplyRepository {
  findAll(): Promise<QuickReplyData[]>;
  findById(id: string): Promise<QuickReplyData | null>;
  create(data: Omit<QuickReplyData, 'id' | 'createdAt'>): Promise<QuickReplyData>;
  update(id: string, data: Partial<Omit<QuickReplyData, 'id' | 'createdAt'>>): Promise<QuickReplyData>;
  delete(id: string): Promise<void>;
}

export const QUICK_REPLY_REPOSITORY = Symbol('IQuickReplyRepository');
