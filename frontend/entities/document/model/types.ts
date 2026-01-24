export interface Document {
  id: string;
  name: string;
  type: string;
  sourceUrl?: string;
  storageUrl?: string;
  content?: string;
  contentHash?: string;
  createdAt: string;
  updatedAt: string;
  chunkCount?: number;
}

export interface CrawlSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  sourceUrl: string;
  lastRun?: string;
  nextRun?: string;
}
