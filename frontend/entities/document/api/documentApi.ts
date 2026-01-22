import { api } from '@/shared/lib/api';

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

export interface CrawlRequest {
  sourceUrl: string;
}

export interface UploadDocumentResponse {
  id: string;
  chunksCreated: number;
}

export interface CrawlResponse {
  logId: string;
}

export const documentApi = {
  getAll: () => api.get<Document[]>('/api/admin/documents').then((r) => r.data),

  upload: (file: File, sourceUrl?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (sourceUrl) {
      formData.append('sourceUrl', sourceUrl);
    }
    return api
      .post<UploadDocumentResponse>('/api/admin/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((r) => r.data);
  },

  delete: (id: string) => api.delete(`/api/admin/documents/${id}`).then((r) => r.data),

  download: async (id: string, fileName: string) => {
    const response = await api.get(`/api/admin/documents/${id}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  triggerCrawl: (request: CrawlRequest) =>
    api.post<CrawlResponse>('/api/admin/documents/crawl', request).then((r) => r.data),

  getCrawlSchedule: () => api.get<CrawlSchedule>('/api/admin/documents/crawl/schedule').then((r) => r.data),

  updateCrawlSchedule: (schedule: CrawlSchedule) =>
    api.patch<CrawlSchedule>('/api/admin/documents/crawl/schedule', schedule).then((r) => r.data),
};
