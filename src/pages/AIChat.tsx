import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingResult } from '@/components/StoreOnboarding';
import { StoreConfig } from '@/components/StorePreview';
import StorePreview from '@/components/StorePreview';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput, ChatAttachment } from '@/components/chat/ChatInput';
import { ChatWelcome } from '@/components/chat/ChatWelcome';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { useConversations, MessageAttachment } from '@/hooks/useConversations';
import type { DesignVariant } from '@/components/chat/DesignVariants';
import { Sparkles, PanelRight, X, Plus, Menu, Crown, Zap, Settings2, Rocket, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { applyModification } from '@/lib/storeModifications';
import { StoreEditorPanel } from '@/components/StoreEditorPanel';
import { ExportPublishDialog } from '@/components/ExportPublishDialog';
import { useHistoryState } from '@/hooks/useHistoryState';

const STORE_CONTEXT_KEY = 'droop_store_context';
const STORE_CONFIG_KEY = 'droop_store_config';

export default function AIChat() {
  const navigate = useNavigate();
  const { user, incrementAiMessages, getAiMessagesRemaining, getDailyLimit, isUnlimitedPlan } = useAuth();
  const onboardingDone = localStorage.getItem('droop_onboarding_complete') === 'true';

  const {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    deleteConversation,
    addMessage,
    updateMessage,
  } = useConversations();

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [storeContext] = useState<OnboardingResult | null>(() => {
    const saved = localStorage.getItem(STORE_CONTEXT_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [storeConfig, setStoreConfig, storeConfigHistory] = useHistoryState<StoreConfig>(
    (() => {
      const saved = localStorage.getItem(STORE_CONFIG_KEY);
      return saved ? JSON.parse(saved) : {};
    })()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = activeConversation?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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

  const handleApplyVariant = useCallback((convId: string, msgId: string) => (variant: DesignVariant, index: number) => {
    setStoreConfig(prev => ({
      ...prev,
      storeName: variant.storeName || prev.storeName,
      storeType: variant.storeType || prev.storeType,
      primaryColor: variant.primaryColor,
      accentColor: variant.accentColor,
      bgColor: variant.bgColor,
      heroText: variant.heroText,
      heroSubtext: variant.heroSubtext,
      heroButtonText: variant.heroButtonText,
      logo: variant.logo,
      borderRadius: variant.borderRadius,
      layout: variant.layout,
      productColumns: variant.productColumns,
      features: variant.features,
      categories: variant.categories,
      products: variant.products && variant.products.length > 0 ? variant.products : prev.products,
      testimonials: variant.testimonials && variant.testimonials.length > 0 ? variant.testimonials : prev.testimonials,
      banners: variant.banners && variant.banners.length > 0 ? variant.banners : prev.banners,
      faq: variant.faq && variant.faq.length > 0 ? variant.faq : prev.faq,
      showHero: true,
    }));
    updateMessage(convId, msgId, { appliedVariantIndex: index });
    toast.success(`Applied design "${variant.name}"!`, {
      action: { label: 'View store', onClick: () => setShowPreview(true) },
    });
    setShowPreview(true);
  }, [updateMessage]);


  // Auto-send initial message for new conversations with no messages
  const [initialSentFor, setInitialSentFor] = useState<string | null>(null);
  useEffect(() => {
    if (!activeId || !storeContext || messages.length > 0 || initialSentFor === activeId || isTyping) return;
    // Only auto-send for the very first conversation ever
    if (conversations.length > 1 || initialSentFor !== null) return;

    setInitialSentFor(activeId);
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

        addMessage(activeId, {
          role: 'assistant',
          content: data.content,
          designVariants: data.designVariants,
          source: data.source,
        });
      } catch {
        const fallback = storeContext.hasStore
          ? `Hi! I'll help you improve your store **${storeContext.storeUrl}**. What would you like to enhance?`
          : `Hi! Let's build your store **${storeContext.storeName || storeContext.storeType || ''}** together! Just tell me what you want!`;
        addMessage(activeId, { role: 'assistant', content: fallback });
      } finally {
        setIsTyping(false);
      }
    };
    sendInitial();
  }, [activeId, storeContext, messages.length, initialSentFor, conversations.length, handleStoreModification, addMessage, isTyping]);

  if (!onboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleNewChat = () => {
    createConversation();
    setShowSidebar(false);
    setAttachments([]);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAddAttachments = (files: FileList) => {
    const newAttachments: ChatAttachment[] = [];
    Array.from(files).forEach(file => {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File too large (max 20MB)');
        return;
      }
      const type = file.type.startsWith('video/') ? 'video' as const : 'image' as const;
      newAttachments.push({ file, preview: URL.createObjectURL(file), type });
    });
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if ((!input.trim() && attachments.length === 0) || isTyping) return;

    // Check message limit
    if (user && !incrementAiMessages()) {
      toast.error(`You've reached the daily limit (${getDailyLimit()} messages). Upgrade for more!`, {
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/upgrade'),
        },
      });
      return;
    }

    let convId = activeId;
    if (!convId) {
      convId = createConversation();
    }

    const userContent = input.trim();
    const currentAttachments = [...attachments];
    
    // Save attachment previews for message display
    const messageAttachments: MessageAttachment[] = currentAttachments.map(a => ({
      url: a.preview,
      type: a.type,
    }));

    addMessage(convId, { role: 'user', content: userContent || '📎 Attachments', attachments: messageAttachments });
    setInput('');
    setAttachments([]);
    setIsTyping(true);

    try {
      // Build multimodal content for the current message
      let currentMessageContent: any = userContent || 'What is this?';
      
      if (currentAttachments.length > 0) {
        const parts: any[] = [];
        if (userContent) {
          parts.push({ type: 'text', text: userContent });
        }
        for (const att of currentAttachments) {
          if (att.type === 'image') {
            const base64 = await fileToBase64(att.file);
            parts.push({
              type: 'image_url',
              image_url: { url: base64 },
            });
          } else {
            // For video, send as text description since most models don't support video inline
            parts.push({ type: 'text', text: `[Video attached: ${att.file.name}]` });
          }
        }
        if (parts.length === 0) parts.push({ type: 'text', text: 'What is this?' });
        currentMessageContent = parts;
      }

      // Build message history (text only for previous messages)
      const prevMessages = (conversations.find(c => c.id === convId)?.messages || [])
        .map(m => ({ role: m.role, content: m.content }));
      
      const allMessages = [
        ...prevMessages,
        { role: 'user' as const, content: currentMessageContent },
      ];

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: allMessages,
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

      addMessage(convId, {
        role: 'assistant',
        content: data.content,
        designVariants: data.designVariants,
        source: data.source,
      });
    } catch (err) {
      console.error('AI Chat error:', err);
      addMessage(convId, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' });
    } finally {
      setIsTyping(false);
    }
  };

  const hasMessages = messages.length > 0 || isTyping;

  return (
    <div className="flex h-screen bg-background">
      {/* Conversation Sidebar */}
      <ConversationSidebar
        conversations={conversations.map(c => ({
          id: c.id,
          title: c.title,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }))}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewChat}
        onDelete={deleteConversation}
        open={showSidebar}
        onClose={() => setShowSidebar(false)}
      />

      {/* Main Chat Area */}
      <div className={cn(
        'flex flex-col flex-1 min-w-0 transition-all duration-300',
        showPreview && 'lg:mr-[420px]'
      )}>
        {/* Top Bar */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(true)}
              className="h-9 w-9 rounded-lg lg:hidden"
              title="Conversations"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-none">DROOB AI</h1>
              <p className="text-[11px] text-muted-foreground">Your smart assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Message counter */}
            {user && !isUnlimitedPlan() && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{getAiMessagesRemaining()}</span>/{getDailyLimit()}
                </span>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  title="More"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={handleNewChat} className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>New chat</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPreview(!showPreview)} className="cursor-pointer">
                  <PanelRight className="h-4 w-4 mr-2" />
                  <span>{showPreview ? 'Hide store' : 'View store'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowExport(true)} className="cursor-pointer">
                  <Rocket className="h-4 w-4 mr-2 text-emerald-600" />
                  <span className="font-medium">Publish Store</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEditor(true)} className="cursor-pointer">
                  <Settings2 className="h-4 w-4 mr-2" />
                  <span>Customize Store</span>
                </DropdownMenuItem>
                {(!user || user.plan !== 'premium') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/upgrade')} className="cursor-pointer">
                      <Crown className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="font-semibold text-primary">Upgrade Plan</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages / Welcome */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <ChatWelcome onSuggestionClick={setInput} />
          ) : (
            <div className="pb-4">
              {messages.map(msg => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  attachments={msg.attachments}
                  designVariants={msg.designVariants}
                  appliedVariantIndex={msg.appliedVariantIndex}
                  source={msg.source}
                  onApplyVariant={activeId ? handleApplyVariant(activeId, msg.id) : undefined}
                  onRegenerateVariants={() => {
                    setInput('اقترح 3 تصاميم جديدة ومختلفة كلياً عن السابقة بألوان وأسلوب مختلف');
                    setTimeout(() => handleSubmit(), 50);
                  }}
                  onCustomizeStore={() => setShowEditor(true)}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Limit reached banner */}
        {user && !isUnlimitedPlan() && getAiMessagesRemaining() === 0 && (
          <div className="mx-4 mb-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground">لقد استنفدت رسائلك اليومية ({getDailyLimit()} رسائل)</span>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/upgrade')}
              className="gradient-button rounded-lg gap-1.5 text-xs shrink-0"
            >
              <Crown className="h-3.5 w-3.5" /> ترقية الآن
            </Button>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/30 bg-background pt-3">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={isTyping || (user ? !isUnlimitedPlan() && getAiMessagesRemaining() === 0 : false)}
            attachments={attachments}
            onAddAttachments={handleAddAttachments}
            onRemoveAttachment={handleRemoveAttachment}
          />
        </div>
      </div>

      {/* Store Preview Side Panel */}
      {showPreview && (
        <>
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
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditor(true)}
                  className="h-8 gap-1.5 rounded-lg text-xs bg-primary/10 text-primary hover:bg-primary/20"
                  title="تخصيص المتجر"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  <span>تخصيص</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                  className="h-8 w-8 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <StorePreview storeContext={storeContext} storeConfig={storeConfig} />
            </div>
          </div>
        </>
      )}

      {/* Manual Store Editor */}
      <StoreEditorPanel
        open={showEditor}
        onOpenChange={setShowEditor}
        config={storeConfig}
        onChange={setStoreConfig}
        onUndo={storeConfigHistory.undo}
        onRedo={storeConfigHistory.redo}
        canUndo={storeConfigHistory.canUndo}
        canRedo={storeConfigHistory.canRedo}
      />

      {/* Export & Publish Dialog */}
      <ExportPublishDialog
        open={showExport}
        onOpenChange={setShowExport}
        config={storeConfig}
      />
    </div>
  );
}
