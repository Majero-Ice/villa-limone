'use client';

import { useEffect } from 'react';
import { useChatStore } from './model/chat.store';
import { ChatButton } from './ui/ChatButton';
import { ChatWindow } from './ui/ChatWindow';
import { getSessionId } from '@/shared/lib/session';

export function ChatWidget() {
  const { setSessionId, sendMessage } = useChatStore();

  useEffect(() => {
    const sessionId = getSessionId();
    setSessionId(sessionId);
  }, [setSessionId]);

  return (
    <>
      <ChatButton />
      <ChatWindow onSendMessage={sendMessage} />
    </>
  );
}
