import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StoreOnboarding, { OnboardingResult } from '@/components/StoreOnboarding';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Lock,
  Crown,
  MessageCircle,
  AlertCircle,
  Store,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STORE_CONTEXT_KEY = 'droop_store_context';

export default function AIChat() {
  const { user, incrementAiMessages, getAiMessagesRemaining, getDailyLimit, isUnlimitedPlan } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [storeContext, setStoreContext] = useState<OnboardingResult | null>(() => {
    const saved = localStorage.getItem(STORE_CONTEXT_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const unlimited = isUnlimitedPlan();
  const remaining = getAiMessagesRemaining();
  const dailyLimit = getDailyLimit();
  const messagesUsedToday = unlimited ? 0 : dailyLimit - remaining;
  const isLimitReached = !unlimited && remaining <= 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-send initial AI message based on store context on first load
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

Welcome them and present a store design concept with layout, categories, colors, and first steps.`;
        }

        const { data, error } = await supabase.functions.invoke('ai-chat', {
          body: { messages: [{ role: 'user', content: initialPrompt }], storeUrl: storeContext.storeUrl || '' },
        });
        if (error) throw error;
        setMessages([{ id: Date.now().toString(), role: 'assistant', content: data.content, timestamp: new Date() }]);
      } catch {
        setMessages([{
          id: Date.now().toString(), role: 'assistant',
          content: storeContext.hasStore
            ? `Welcome! I'll help you optimize your store at **${storeContext.storeUrl}**. What would you like to improve?`
            : `Welcome! Let's build your **${storeContext.storeType || ''}** store together!`,
          timestamp: new Date(),
        }]);
      } finally {
        setIsTyping(false);
      }
    };
    sendInitial();
  }, [storeContext, initialSent, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isLimitReached) return;

    const canSend = incrementAiMessages();
    if (!canSend) return;

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
          storeUrl: storeContext?.storeUrl || user?.storeUrl || '',
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Chat error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="icon-action icon-solid-primary">
              <Bot className="h-7 w-7" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              DROOP AI
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Assistant</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Your AI-powered sales & business intelligence companion
            </p>
          </div>
        </div>

        {!unlimited && (
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              isLimitReached
                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                : remaining <= 2
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-muted text-muted-foreground border border-border/50'
            )}>
              <MessageCircle className="h-4 w-4" />
              <span>{messagesUsedToday} / {dailyLimit} messages used today</span>
            </div>
          </div>
        )}
        {unlimited && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span>Unlimited Messages</span>
            </div>
          </div>
        )}
      </div>

      {/* Store Context */}
      {storeContext?.storeUrl && (
        <div className="py-3 px-4 mt-4 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <Store className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Analyzing:</span>
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
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative mb-6">
              <div className="p-5 rounded-2xl gradient-button shadow-xl">
                <Bot className="h-10 w-10 text-primary-foreground" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Hey! I'm DROOP AI</h2>
            <p className="text-muted-foreground max-w-md mb-8 text-lg">
              Your AI sales assistant. Ask me about business strategies, market analysis, pricing, and growth tactics.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              {[
                'What are the best markets to enter in 2024?',
                'How should I price my products?',
                'Give me growth strategies for my store',
                'Analyze market opportunities for my niche',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="text-left text-sm p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all border border-border/50 hover:border-primary/30 hover:shadow-md"
                  disabled={isLimitReached}
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
                  message.role === 'user'
                    ? 'gradient-button'
                    : 'bg-muted'
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
                  message.role === 'user'
                    ? 'gradient-button'
                    : 'bg-muted'
                )}
              >
                <div className={cn(
                  'text-sm whitespace-pre-wrap leading-relaxed',
                  message.role === 'user' && 'text-primary-foreground'
                )}>
                  {message.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <p key={i} className="font-semibold mt-3 mb-1">
                          {line.replace(/\*\*/g, '')}
                        </p>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <p key={i} className="ml-4">
                          • {line.slice(2)}
                        </p>
                      );
                    }
                    if (line.match(/^\d+\./)) {
                      return (
                        <p key={i} className="ml-4">
                          {line}
                        </p>
                      );
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

      {/* Daily Limit Reached Banner */}
      {isLimitReached && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Daily message limit reached</p>
              <p className="text-sm text-muted-foreground mt-1">
                You've used all {dailyLimit} messages for today. Your limit will reset tomorrow, or upgrade to a paid plan for unlimited messages.
              </p>
            </div>
            <Link to="/pricing">
              <Button size="sm" className="gap-2 gradient-button">
                <Crown className="h-4 w-4" />
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-border">
        <div className="relative flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLimitReached ? 'Upgrade to continue chatting...' : t('ai.placeholder')}
            disabled={isTyping || isLimitReached}
            className="pr-12 h-12 input-focus rounded-xl"
          />
          {isLimitReached && (
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={!input.trim() || isTyping || isLimitReached}
          className="h-12 px-6 gradient-button rounded-xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
