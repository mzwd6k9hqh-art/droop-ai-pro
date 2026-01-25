import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAIResponse } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function AIChat() {
  const { user, incrementAiMessages, getAiMessagesRemaining } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const remaining = getAiMessagesRemaining();
  const isLimitReached = remaining <= 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    // Simulate AI response delay
    setTimeout(() => {
      const response = getAIResponse(userMessage.content, user?.storeUrl);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="icon-action icon-solid-primary">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{t('ai.title')}</h1>
            <p className="text-sm text-muted-foreground">
              Get intelligent business insights and recommendations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
            isLimitReached
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted text-muted-foreground'
          )}>
            <MessageCircle className="h-4 w-4" />
            {remaining === Infinity ? (
              <span>Unlimited</span>
            ) : (
              <span>{remaining} {t('ai.remaining')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Store Context */}
      {user?.storeUrl && (
        <div className="py-3 px-4 mt-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <Store className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Analyzing:</span>
            <a 
              href={user.storeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {user.storeUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Start a Conversation</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Ask DROOP AI about business strategies, market analysis, pricing, growth tactics, and more
              {user?.storeUrl && ` for ${user.storeUrl}`}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
              {[
                'What are the best markets to enter in 2024?',
                'How should I price my products?',
                'Give me growth strategies for my store',
                'Analyze market opportunities for my niche',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="text-left text-sm p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors border border-border/50"
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
                  <User className="h-5 w-5 text-white" />
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
                  message.role === 'user' && 'text-white'
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

      {/* Limit Reached Banner */}
      {isLimitReached && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive">{t('ai.limit')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('ai.upgrade')}
              </p>
            </div>
            <Link to="/pricing">
              <Button size="sm" className="gap-2 gradient-button">
                <Crown className="h-4 w-4" />
                Upgrade
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
