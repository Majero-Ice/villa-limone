import { MessageCircle, X } from 'lucide-react';
import { useChatStore } from '../model/chat.store';
import { cn } from '@/shared/lib/utils';

export function ChatButton() {
  const { isOpen, toggle } = useChatStore();

  return (
    <button
      onClick={toggle}
      className={cn(
        'fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lifted',
        'flex items-center justify-center transition-all duration-300',
        'hover:scale-110 active:scale-95',
        'focus:outline-none focus:ring-4 focus:ring-terracotta/30',
        'z-50',
        isOpen 
          ? 'bg-graphite text-white' 
          : 'bg-terracotta text-white'
      )}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <MessageCircle className="w-6 h-6" />
      )}
    </button>
  );
}
