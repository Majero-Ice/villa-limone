import { Message } from '../model/types';
import { cn } from '@/shared/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        'flex w-full mb-4 animate-slide-up',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3 shadow-soft',
          isUser
            ? 'bg-terracotta text-white'
            : 'bg-white text-graphite border border-soft-beige'
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
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
        <time className={cn(
          'text-xs mt-2 block',
          isUser ? 'text-terracotta-light' : 'text-warm-gray'
        )}>
          {new Date(message.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </time>
      </div>
    </div>
  );
}
