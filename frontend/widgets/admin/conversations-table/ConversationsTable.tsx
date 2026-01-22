'use client';

import Link from 'next/link';
import { Conversation } from '@/entities/conversation';
import { formatDateTime } from '@/shared/lib/formatDate';
import { Badge } from '@/shared/ui';

interface ConversationsTableProps {
  conversations: Conversation[];
}

export function ConversationsTable({ conversations }: ConversationsTableProps) {
  if (conversations.length === 0) {
    return (
      <div className="card-base p-12 text-center">
        <p className="text-warm-gray">No conversations found</p>
      </div>
    );
  }

  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-soft-beige">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Session ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">First Message</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Messages</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Updated</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-graphite">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soft-beige">
            {conversations.map((conversation) => (
              <tr key={conversation.id} className="hover:bg-sand/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-mono text-sm text-graphite">
                    {conversation.sessionId.substring(0, 8)}...
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-graphite max-w-md truncate">
                    {conversation.firstMessage || 'No messages'}
                  </div>
                </td>
                <td className="px-6 py-4 text-graphite">{conversation.messageCount}</td>
                <td className="px-6 py-4">
                  {conversation.hasReservation ? (
                    <Badge variant="success">Has Reservation</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-warm-gray">
                  {formatDateTime(conversation.updatedAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/chats/${conversation.id}`}
                    className="text-terracotta hover:text-terracotta-dark font-medium text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
