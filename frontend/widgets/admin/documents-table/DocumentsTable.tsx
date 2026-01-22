'use client';

import { Document, documentApi } from '@/entities/document';
import { formatDate } from '@/shared/lib/formatDate';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useState } from 'react';

interface DocumentsTableProps {
  documents: Document[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function DocumentsTable({ documents, onDelete, isLoading }: DocumentsTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (doc: Document) => {
    if (!doc.storageUrl) {
      alert('File not available for download');
      return;
    }

    try {
      setDownloadingId(doc.id);
      await documentApi.download(doc.id, doc.name);
    } catch (error) {
      alert('Failed to download file');
      console.error(error);
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="text-warm-gray">Loading documents...</div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="text-warm-gray text-center py-8">No documents found</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-sand">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Chunks</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Created</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soft-beige">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-sand/50 transition-colors">
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={!doc.storageUrl || downloadingId === doc.id}
                    className={`font-medium text-graphite hover:text-terracotta transition-colors ${
                      doc.storageUrl ? 'cursor-pointer hover:underline' : 'cursor-not-allowed opacity-50'
                    } ${downloadingId === doc.id ? 'opacity-50' : ''}`}
                  >
                    {doc.name}
                    {downloadingId === doc.id && ' (downloading...)'}
                  </button>
                  {doc.sourceUrl && (
                    <div className="text-sm text-warm-gray mt-1">{doc.sourceUrl}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-terracotta/10 text-terracotta">
                    {doc.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-warm-gray">{doc.chunkCount || 0}</td>
                <td className="px-6 py-4 text-warm-gray text-sm">{formatDate(doc.createdAt)}</td>
                <td className="px-6 py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(doc.id)}
                    className="text-danger hover:text-danger hover:bg-danger/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
