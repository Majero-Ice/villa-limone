'use client';

import { useEffect, useState } from 'react';
import { AdminHeader, ConversationsTable } from '@/widgets/admin';
import { ConversationListResponse, conversationApi } from '@/entities/conversation';
import { Button } from '@/shared/ui';

export default function ChatsPage() {
  const [data, setData] = useState<ConversationListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      try {
        const result = await conversationApi.getAll({
          page,
          limit: 20,
          orderBy: 'createdAt',
          order: 'desc',
        });
        setData(result);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [page]);

  return (
    <>
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-serif text-graphite">Chats</h1>
          </div>

          {isLoading ? (
            <div className="card-base p-12 text-center">
              <p className="text-warm-gray">Loading conversations...</p>
            </div>
          ) : data ? (
            <>
              <ConversationsTable conversations={data.conversations} />
              {data.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-warm-gray">
                    Page {data.page} of {data.totalPages} ({data.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page === data.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card-base p-12 text-center">
              <p className="text-warm-gray">Failed to load conversations</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
