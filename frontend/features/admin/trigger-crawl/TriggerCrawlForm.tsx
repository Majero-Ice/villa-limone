'use client';

import { useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui';
import { documentApi } from '@/entities/document';

interface TriggerCrawlFormProps {
  onSuccess: () => void;
}

export function TriggerCrawlForm({ onSuccess }: TriggerCrawlFormProps) {
  const [url, setUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsCrawling(true);
    setError(null);

    try {
      await documentApi.triggerCrawl({ sourceUrl: url });
      setUrl('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to crawl website');
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-graphite mb-4 flex items-center gap-2">
        <Globe size={20} />
        Crawl Website
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-graphite mb-2">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-soft-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta"
            disabled={isCrawling}
          />
        </div>

        {error && (
          <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg">{error}</div>
        )}

        <Button type="submit" disabled={!url || isCrawling} className="w-full">
          {isCrawling ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Crawling...
            </>
          ) : (
            'Start Crawl'
          )}
        </Button>
      </div>
    </form>
  );
}
