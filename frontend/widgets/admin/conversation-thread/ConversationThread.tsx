'use client';

import { ConversationDetail, Message } from '@/entities/conversation';
import { formatDateTime } from '@/shared/lib/formatDate';
import { Badge } from '@/shared/ui';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ConversationThreadProps {
  conversation: ConversationDetail;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'USER';
  const isSystem = message.role === 'SYSTEM';
  const isAssistant = message.role === 'ASSISTANT';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-soft-beige text-warm-gray text-sm px-4 py-2 rounded-lg">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-terracotta text-white'
            : 'bg-sand text-graphite'
        }`}
      >
        {isUser ? (
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none 
            prose-headings:text-graphite prose-headings:font-serif prose-headings:mt-3 prose-headings:mb-2
            prose-p:text-graphite prose-p:my-2
            prose-strong:text-terracotta prose-strong:font-semibold
            prose-ul:text-graphite prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
            prose-ol:text-graphite prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-4
            prose-li:text-graphite prose-li:my-1
            prose-a:text-terracotta prose-a:no-underline hover:prose-a:underline
            prose-code:text-terracotta-dark prose-code:bg-sand prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-terracotta-light' : 'text-warm-gray'
          }`}
        >
          {formatDateTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}

export function ConversationThread({ conversation }: ConversationThreadProps) {
  return (
    <div className="card-base">
      <div className="p-6 border-b border-soft-beige">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-h3 text-graphite mb-2">Conversation Details</h2>
            <div className="flex items-center gap-4 text-sm text-warm-gray">
              <span>Session: {conversation.sessionId.substring(0, 16)}...</span>
              <span>{conversation.messageCount} messages</span>
            </div>
          </div>
          <div>
            {conversation.hasReservation ? (
              <Badge variant="success">Has Reservation</Badge>
            ) : (
              <Badge variant="default">Active</Badge>
            )}
          </div>
        </div>
        <div className="text-sm text-warm-gray">
          <div>Created: {formatDateTime(conversation.createdAt)}</div>
          <div>Updated: {formatDateTime(conversation.updatedAt)}</div>
        </div>
      </div>

      <div className="p-6 bg-sand/30 min-h-[400px] max-h-[600px] overflow-y-auto">
        {conversation.messages.length === 0 ? (
          <div className="text-center text-warm-gray py-12">
            No messages in this conversation
          </div>
        ) : (
          conversation.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>
    </div>
  );
}
