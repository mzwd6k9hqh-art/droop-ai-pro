import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingResult } from '@/components/StoreOnboarding';
import { StoreConfig } from '@/components/StorePreview';
import StorePreview from '@/components/StorePreview';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatWelcome } from '@/components/chat/ChatWelcome';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Sparkles, PanelRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STORE_CONTEXT_KEY = 'droop_store_context';
const STORE_CONFIG_KEY = 'droop_store_config';

function applyModification(current: StoreConfig, functionCall: any): StoreConfig {
  const { action, target, details } = functionCall;
  const updated = { ...current };

  switch (action) {
    case 'update_product': {
      if (updated.products) {
        updated.products = updated.products.map(p =>
          p.name.toLowerCase().includes((target || '').toLowerCase())
            ? { ...p, ...details }
            : p
        );
      }
      break;
    }
    case 'add_product': {
      const newProduct = {
        name: details?.name || target || 'New Product',
        price: details?.price || '$0.00',
        image: details?.image || '📦',
      };
      updated.products = [...(updated.products || []), newProduct];
      break;
    }
    case 'remove_product': {
      if (updated.products) {
        updated.products = updated.products.filter(
          p => !p.name.toLowerCase().includes((target || '').toLowerCase())
        );
      }
      break;
    }
    case 'change_color':
    case 'update_color': {
      if (details?.primary) updated.primaryColor = details.primary;
      if (details?.accent) updated.accentColor = details.accent;
      if (details?.background || details?.bg) updated.bgColor = details.background || details.bg;
      break;
    }
    case 'update_layout': {
      if (details?.layout) updated.layout = details.layout;
      break;
    }
    case 'update_description': {
      if (details?.description) updated.description = details.description;
      if (details?.heroText) updated.heroText = details.heroText;
      if (details?.heroSubtext) updated.heroSubtext = details.heroSubtext;
      break;
    }
    case 'update_name':
    case 'update_store_name': {
      updated.storeName = details?.name || target;
      break;
    }
    case 'update_hero': {
      if (details?.text) updated.heroText = details.text;
      if (details?.subtext) updated.heroSubtext = details.subtext;
      if (details?.show !== undefined) updated.showHero = details.show;
      break;
    }
    case 'update_features': {
      if (details?.features) updated.features = details.features;
      break;
    }
    case 'update_price': {
      if (updated.products) {
        updated.products = updated.products.map(p =>
          p.name.toLowerCase().includes((target || '').toLowerCase())
            ? { ...p, price: details?.price || p.price }
            : p
        );
      }
      break;
    }
    case 'update_image': {
      if (updated.products) {
        updated.products = updated.products.map(p =>
          p.name.toLowerCase().includes((target || '').toLowerCase())
            ? { ...p, image: details?.image || p.image }
            : p
        );
      }
      break;
    }
    case 'update_currency': {
      updated.currency = details?.currency || target;
      break;
    }
    case 'update_store_type': {
      updated.storeType = details?.type || target;
      updated.products = undefined;
      break;
    }
    default: {
      if (details) {
        Object.assign(updated, details);
      }
      break;
    }
  }

  return updated;
}

export default function AIChat() {
  const onboardingDone = localStorage.getItem('droop_onboarding_complete') === 'true';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [storeContext] = useState<OnboardingResult | null>(() => {
    const saved = localStorage.getItem(STORE_CONTEXT_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    const saved = localStorage.getItem(STORE_CONFIG_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORE_CONFIG_KEY, JSON.stringify(storeConfig));
  }, [storeConfig]);

  const handleStoreModification = useCallback((functionCall: any) => {
    setStoreConfig(prev => applyModification(prev, functionCall));
    toast.success('تم تحديث تصميم المتجر!', {
      action: {
        label: 'عرض المتجر',
        onClick: () => setShowPreview(true),
      },
    });
  }, []);

  const [initialSent, setInitialSent] = useState(false);
  useEffect(() => {
    if (initialSent || !storeContext || messages.length > 0) return;
    setInitialSent(true);
    setIsTyping(true);

    const sendInitial = async () => {
      try {
        let initialPrompt: string;
        if (storeContext.hasStore && storeContext.storeUrl) {
          initialPrompt = `The user just connected their store at ${storeContext.storeUrl}. Analyze this store URL and give them a warm welcome with initial insights and suggestions for improvement.`;
        } else {
          initialPrompt = `The user wants to create a new online store. Preferences:
- Store type: ${storeContext.storeType || 'general'}
- Interests: ${storeContext.interests?.join(', ') || 'general'}
- Store name: ${storeContext.storeName || 'TBD'}
${storeContext.description ? `- Description: ${storeContext.description}` : ''}

Welcome them and present a store design concept with layout, categories, colors, and first steps. IMPORTANT: Call the modify_store function to set up the initial store design with appropriate products, colors, and layout based on their preferences.`;
        }

        const { data, error } = await supabase.functions.invoke('ai-chat', {
          body: { messages: [{ role: 'user', content: initialPrompt }], storeUrl: storeContext.storeUrl || '' },
        });
        if (error) throw error;

        if (data.type === 'modify_store') {
          if (data.functionCalls && Array.isArray(data.functionCalls)) {
            data.functionCalls.forEach((fc: any) => handleStoreModification(fc));
          } else if (data.functionCall) {
            handleStoreModification(data.functionCall);
          }
        }

        setMessages([{ id: Date.now().toString(), role: 'assistant', content: data.content, timestamp: new Date() }]);
      } catch {
        setMessages([{
          id: Date.now().toString(), role: 'assistant',
          content: storeContext.hasStore
            ? `مرحباً! سأساعدك في تحسين متجرك **${storeContext.storeUrl}**. ماذا تريد تحسينه؟`
            : `مرحباً! هيا نبني متجرك **${storeContext.storeName || storeContext.storeType || ''}** معاً! اطلب مني أي تعديل!`,
          timestamp: new Date(),
        }]);
      } finally {
        setIsTyping(false);
      }
    };
    sendInitial();
  }, [storeContext, initialSent, messages.length, handleStoreModification]);

  if (!onboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSubmit = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: conversationHistory,
          storeUrl: storeContext?.storeUrl || '',
        },
      });

      if (error) throw error;

      if (data.type === 'modify_store') {
        if (data.functionCalls && Array.isArray(data.functionCalls)) {
          data.functionCalls.forEach((fc: any) => handleStoreModification(fc));
        } else if (data.functionCall) {
          handleStoreModification(data.functionCall);
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error('AI Chat error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const hasMessages = messages.length > 0 || isTyping;

  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat Area */}
      <div className={cn(
        'flex flex-col flex-1 min-w-0 transition-all duration-300',
        showPreview && 'lg:mr-[420px]'
      )}>
        {/* Top Bar */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-none">DROOP AI</h1>
              <p className="text-[11px] text-muted-foreground">مساعدك الذكي</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              'h-9 w-9 rounded-lg',
              showPreview && 'bg-primary/10 text-primary'
            )}
            title="عرض المتجر"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages / Welcome */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <ChatWelcome onSuggestionClick={setInput} />
          ) : (
            <div className="pb-4">
              {messages.map(msg => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border/30 bg-background pt-3">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={isTyping}
          />
        </div>
      </div>

      {/* Store Preview Side Panel */}
      {showPreview && (
        <>
          {/* Mobile overlay */}
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setShowPreview(false)}
          />
          <div className={cn(
            'fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 lg:z-0',
            'bg-background border-l border-border',
            'flex flex-col animate-in slide-in-from-right duration-300'
          )}>
            <div className="flex items-center justify-between h-14 px-4 border-b border-border/50">
              <h2 className="text-sm font-semibold text-foreground">معاينة المتجر</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(false)}
                className="h-8 w-8 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <StorePreview storeContext={storeContext} storeConfig={storeConfig} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
