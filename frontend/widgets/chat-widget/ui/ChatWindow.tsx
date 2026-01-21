import { useEffect, useRef, useState } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { useChatStore } from '../model/chat.store';
import { ChatMessage, TypingIndicator } from '@/entities/message';
import { ChatInput } from './ChatInput';
import { cn } from '@/shared/lib/utils';

interface ChatWindowProps {
  onSendMessage: (message: string) => void;
}

export function ChatWindow({ onSendMessage }: ChatWindowProps) {
  const { messages, isLoading, isOpen, close } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 bg-ivory rounded-xl shadow-lifted overflow-hidden flex flex-col animate-slide-up',
        'transition-all duration-300',
        isExpanded 
          ? 'w-[90vw] h-[85vh] md:w-[600px] md:h-[700px]'
          : 'w-[90vw] h-[500px] md:w-[400px] md:h-[600px]'
      )}
    >
      <div className="bg-terracotta text-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-serif font-semibold text-lg">Villa Limone</h3>
          <p className="text-sm text-terracotta-light">AI Concierge</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-terracotta-dark rounded-lg p-2 transition-colors"
            aria-label={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={close}
            className="hover:bg-terracotta-dark rounded-lg p-2 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-sand/30">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h4 className="font-serif text-h4 text-graphite mb-2">
                Welcome to Villa Limone!
              </h4>
              <p className="text-warm-gray">
                How can I help you today?
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}
