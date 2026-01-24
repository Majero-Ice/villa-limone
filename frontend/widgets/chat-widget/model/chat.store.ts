import { create } from 'zustand';
import { Message } from '@/entities/message';
import { chatApi, ChatMessage } from '@/entities/message/api/chatApi';

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  sessionId: string;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setSessionId: (sessionId: string) => void;
  reset: () => void;
  sendMessage: (content: string) => Promise<void>;
}

function convertToApiHistory(messages: Message[]): ChatMessage[] {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  sessionId: '',
  
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  
  addMessages: (messages) =>
    set((state) => ({
      messages: [...state.messages, ...messages],
    })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  
  open: () => set({ isOpen: true }),
  
  close: () => set({ isOpen: false }),
  
  setSessionId: (sessionId) => set({ sessionId }),
  
  reset: () => set({ messages: [], isOpen: false, isLoading: false }),

  sendMessage: async (content: string) => {
    const state = get();
    
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      conversationId: state.sessionId,
      role: 'user',
      content,
      createdAt: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      const history = convertToApiHistory(state.messages);
      
      const response = await chatApi.sendMessage({
        message: content,
        sessionId: state.sessionId,
        history,
      });

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        conversationId: state.sessionId,
        role: 'assistant',
        content: response.message,
        metadata: {
          sources: response.sources,
          model: response.model,
        },
        createdAt: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      
      const { useToastStore } = await import('@/shared/lib/toast.store');
      useToastStore.getState().error('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        conversationId: state.sessionId,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        metadata: { error: true },
        createdAt: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
      }));
    }
  },
}));
