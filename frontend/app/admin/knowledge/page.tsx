'use client';

import { useState, useEffect } from 'react';
import { DocumentsTable } from '@/widgets/admin/documents-table';
import { UploadDocumentForm } from '@/features/admin/upload-document';
import { TriggerCrawlForm } from '@/features/admin/trigger-crawl';
import { CrawlScheduleForm } from '@/features/admin/crawl-schedule';
import { documentApi, Document } from '@/entities/document';
import { AdminHeader } from '@/widgets/admin';
import { useToastStore } from '@/shared/lib/toast.store';

export default function KnowledgePage() {
  const toast = useToastStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await documentApi.getAll();
      setDocuments(data);
    } catch (err: any) {
      const errorMessage = 'Failed to load documents';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? All associated chunks will be deleted.')) {
      return;
    }

    try {
      await documentApi.delete(id);
      await loadDocuments();
      toast.success('Document deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader />
      
      <main className="flex-1 p-8 bg-ivory">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-3xl font-serif text-graphite mb-6">Knowledge Base</h1>
          
          {error && (
            <div className="bg-danger/10 text-danger p-4 rounded-lg">{error}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UploadDocumentForm onSuccess={loadDocuments} />
            <TriggerCrawlForm onSuccess={loadDocuments} />
          </div>

          <CrawlScheduleForm />

          <div>
            <h2 className="text-2xl font-serif font-semibold text-graphite mb-4">Documents</h2>
            <DocumentsTable
              documents={documents}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
