import { useState, useCallback } from 'react';

export interface MessageAttachment {
  url: string;
  type: 'image' | 'video';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
}

export interface StoredConversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const CONVERSATIONS_KEY = 'droop_conversations';

function loadConversations(): StoredConversation[] {
  try {
    const saved = localStorage.getItem(CONVERSATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveConversations(convs: StoredConversation[]) {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
}

function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim().slice(0, 50);
  return trimmed.length < firstMessage.trim().length ? trimmed + '...' : trimmed;
}

export function useConversations() {
  const [conversations, setConversations] = useState<StoredConversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(() => {
    const convs = loadConversations();
    return convs.length > 0 ? convs[0].id : null;
  });

  const persist = useCallback((updated: StoredConversation[]) => {
    // Sort by updatedAt desc
    const sorted = [...updated].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setConversations(sorted);
    saveConversations(sorted);
  }, []);

  const createConversation = useCallback(() => {
    const newConv: StoredConversation = {
      id: crypto.randomUUID(),
      title: 'محادثة جديدة',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newConv, ...conversations];
    persist(updated);
    setActiveId(newConv.id);
    return newConv.id;
  }, [conversations, persist]);

  const deleteConversation = useCallback((id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    persist(updated);
    if (activeId === id) {
      setActiveId(updated.length > 0 ? updated[0].id : null);
    }
  }, [conversations, activeId, persist]);

  const addMessage = useCallback((convId: string, message: Omit<Message, 'id' | 'timestamp'> & { attachments?: MessageAttachment[] }) => {
    const msg: Message = {
      role: message.role,
      content: message.content,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      attachments: message.attachments,
    };

    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages, msg];
        const title = c.messages.length === 0 && message.role === 'user'
          ? generateTitle(message.content)
          : c.title;
        return { ...c, messages: msgs, title, updatedAt: new Date().toISOString() };
      });
      saveConversations(updated);
      return updated;
    });

    return msg;
  }, []);

  const getMessages = useCallback((convId: string | null) => {
    if (!convId) return [];
    const conv = conversations.find(c => c.id === convId);
    return conv?.messages || [];
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  return {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    deleteConversation,
    addMessage,
    getMessages,
  };
}
