import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DesignVariants, type DesignVariant } from './DesignVariants';

interface MessageAttachment {
  url: string;
  type: 'image' | 'video';
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  attachments?: MessageAttachment[];
  designVariants?: DesignVariant[];
  appliedVariantIndex?: number | null;
  onApplyVariant?: (variant: DesignVariant, index: number) => void;
  onRegenerateVariants?: () => void;
  onCustomizeStore?: () => void;
}

export function ChatMessage({ role, content, attachments, designVariants, appliedVariantIndex, onApplyVariant, onRegenerateVariants, onCustomizeStore }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('group w-full', isUser ? '' : 'bg-muted/30')}>
      <div className="max-w-3xl mx-auto flex gap-4 px-4 py-6 md:px-6">
        {/* Avatar */}
        <div className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <p className={cn(
            'text-xs font-semibold',
            isUser ? 'text-foreground' : 'text-primary'
          )}>
            {isUser ? 'أنت' : 'DROOB AI'}
          </p>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {attachments.map((att, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-border max-w-[200px]">
                  {att.type === 'image' ? (
                    <img src={att.url} alt="" className="w-full h-auto max-h-48 object-cover" />
                  ) : (
                    <video src={att.url} controls className="w-full h-auto max-h-48" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* Design Variants */}
          {designVariants && designVariants.length > 0 && onApplyVariant && (
            <DesignVariants
              variants={designVariants}
              appliedIndex={appliedVariantIndex ?? null}
              onApply={onApplyVariant}
            />
          )}
        </div>
      </div>
    </div>
  );
}
