'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminHeader, ConversationThread } from '@/widgets/admin';
import { ConversationDetail, conversationApi } from '@/entities/conversation';
import { Button } from '@/shared/ui';
import { useToastStore } from '@/shared/lib/toast.store';

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const data = await conversationApi.getById(id);
        setConversation(data);
      } catch (error) {
        console.error('Failed to load conversation:', error);
        useToastStore.getState().error('Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadConversation();
    }
  }, [id]);

  if (isLoading) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="card-base p-12 text-center">
              <p className="text-warm-gray">Loading conversation...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!conversation) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="card-base p-12 text-center">
              <p className="text-warm-gray">Conversation not found</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/chats')}>
                Back to Chats
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push('/admin/chats')}>
              ← Back to Chats
            </Button>
          </div>

          <ConversationThread conversation={conversation} />
        </div>
      </main>
    </>
  );
}
