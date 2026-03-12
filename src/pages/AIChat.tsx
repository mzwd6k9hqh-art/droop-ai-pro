import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnboardingResult } from '@/components/StoreOnboarding';
import StorePreview, { StoreConfig } from '@/components/StorePreview';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Store,
  ExternalLink,
  MessageCircle,
  Palette,
} from 'lucide-react';
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
      // Reset products to match new type
      updated.products = undefined;
      break;
    }
    default: {
      // Generic: merge details into config
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
  const [activeTab, setActiveTab] = useState('chat');
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

  // Persist store config
  useEffect(() => {
    localStorage.setItem(STORE_CONFIG_KEY, JSON.stringify(storeConfig));
  }, [storeConfig]);

  const handleStoreModification = useCallback((functionCall: any) => {
    setStoreConfig(prev => {
      const updated = applyModification(prev, functionCall);
      return updated;
    });
    toast.success('تم تحديث تصميم المتجر! انتقل لتبويب "تصميم المتجر" لرؤية التغييرات', {
      action: {
        label: 'عرض التصميم',
        onClick: () => setActiveTab('preview'),
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

        // Handle initial store modifications (single or multiple)
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
            : `مرحباً! هيا نبني متجرك **${storeContext.storeName || storeContext.storeType || ''}** معاً! يمكنك رؤية التصميم الأولي في تبويب "تصميم المتجر". اطلب مني أي تعديل!`,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const conversationHistory = [...messages, userMessage].map((m) => ({
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

      // Handle store modifications (single or multiple)
      if (data.type === 'modify_store') {
        if (data.functionCalls && Array.isArray(data.functionCalls)) {
          data.functionCalls.forEach((fc: any) => handleStoreModification(fc));
        } else if (data.functionCall) {
          handleStoreModification(data.functionCall);
        }
      }

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error('AI Chat error:', err);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 rounded-xl gradient-button shadow-lg">
              <Bot className="h-7 w-7 text-primary-foreground" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              DROOP AI
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Assistant</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              مساعدك الذكي لبناء وتحسين متجرك
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-2 max-w-sm">
          <TabsTrigger value="chat" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            المحادثة
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Palette className="h-4 w-4" />
            تصميم المتجر
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 px-4 pb-4 mt-0">
          {/* Store Context */}
          {storeContext?.storeUrl && (
            <div className="py-3 px-4 mt-3 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 text-sm">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">تحليل:</span>
                <a
                  href={storeContext.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  {storeContext.storeUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {messages.length === 0 && !isTyping ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="relative mb-6">
                  <div className="p-5 rounded-2xl gradient-button shadow-xl">
                    <Bot className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-2">مرحباً! أنا DROOP AI</h2>
                <p className="text-muted-foreground max-w-md mb-8 text-lg">
                  مساعدك الذكي لبناء متجرك. اطلب مني تعديل التصميم، الألوان، المنتجات، أو أي شيء آخر!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                  {[
                    'غيّر ألوان المتجر إلى الأزرق',
                    'أضف منتج جديد للمتجر',
                    'غيّر اسم المتجر',
                    'غيّر تصميم المنتجات إلى قائمة',
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="text-left text-sm p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all border border-border/50 hover:border-primary/30 hover:shadow-md"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-4 max-w-3xl',
                    message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      message.role === 'user' ? 'gradient-button' : 'bg-muted'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-primary-foreground" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-3 max-w-xl',
                      message.role === 'user' ? 'gradient-button' : 'bg-muted'
                    )}
                  >
                    <div className={cn(
                      'text-sm whitespace-pre-wrap leading-relaxed',
                      message.role === 'user' && 'text-primary-foreground'
                    )}>
                      {message.content.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-semibold mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
                        }
                        if (line.startsWith('- ')) {
                          return <p key={i} className="ml-4">• {line.slice(2)}</p>;
                        }
                        if (line.match(/^\d+\./)) {
                          return <p key={i} className="ml-4">{line}</p>;
                        }
                        return line ? <p key={i}>{line}</p> : <br key={i} />;
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex gap-4 max-w-3xl">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-muted">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-border">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اطلب تعديل على متجرك... مثل: غيّر الألوان، أضف منتج، عدّل الاسم"
                disabled={isTyping}
                className="pr-12 h-12 input-focus rounded-xl"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!input.trim() || isTyping}
              className="h-12 px-6 gradient-button rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </TabsContent>

        {/* Store Preview Tab */}
        <TabsContent value="preview" className="flex-1 min-h-0 overflow-hidden mt-0">
          <StorePreview storeContext={storeContext} storeConfig={storeConfig} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
