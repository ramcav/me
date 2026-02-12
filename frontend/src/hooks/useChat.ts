import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { ChatMessage } from '../types';

let msgId = 0;
function nextId() {
  return `msg-${++msgId}-${Date.now()}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = {
      id: nextId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setError(null);

    const assistantId = nextId();

    try {
      await api.sendChatMessage(content, [...messages, userMsg], (partial) => {
        setMessages(prev => {
          const existing = prev.find(m => m.id === assistantId);
          if (existing) {
            return prev.map(m => m.id === assistantId ? { ...m, content: partial } : m);
          }
          return [
            ...prev,
            {
              id: assistantId,
              role: 'assistant' as const,
              content: partial,
              timestamp: Date.now(),
            },
          ];
        });
      });
    } catch {
      setError('Could not reach the AI assistant. The backend may be offline.');
      setMessages(prev => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content:
            "I'm currently offline. Please check back later or reach out via the contact form below.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isTyping, error, sendMessage, clearChat };
}
