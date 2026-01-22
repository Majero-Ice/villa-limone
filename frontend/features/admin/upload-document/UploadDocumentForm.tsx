'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/shared/ui';
import { documentApi } from '@/entities/document';

interface UploadDocumentFormProps {
  onSuccess: () => void;
}

export function UploadDocumentForm({ onSuccess }: UploadDocumentFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'txt' && ext !== 'md' && ext !== 'markdown') {
        setError('Only .txt and .md files are supported');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await documentApi.upload(file, sourceUrl || undefined);
      setFile(null);
      setSourceUrl('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-graphite mb-4">Upload Document</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-graphite mb-2">File</label>
          <div className="flex items-center gap-4">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".txt,.md,.markdown"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex items-center gap-2 px-4 py-2 border border-soft-beige rounded-lg hover:bg-sand transition-colors">
                <Upload size={20} className="text-warm-gray" />
                <span className="text-graphite">
                  {file ? file.name : 'Choose file (.txt, .md)'}
                </span>
              </div>
            </label>
            {file && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                disabled={isUploading}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-graphite mb-2">
            Source URL (optional)
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-soft-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta"
            disabled={isUploading}
          />
        </div>

        {error && (
          <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg">{error}</div>
        )}

        <Button type="submit" disabled={!file || isUploading} className="w-full">
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
    </form>
  );
}
