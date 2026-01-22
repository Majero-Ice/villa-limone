export interface QuickReply {
  id: string;
  trigger: string;
  response: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface CreateQuickReplyRequest {
  trigger: string;
  response: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateQuickReplyRequest {
  trigger?: string;
  response?: string;
  isActive?: boolean;
  sortOrder?: number;
}
