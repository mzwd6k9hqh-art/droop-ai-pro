import React from 'react';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DesignVariants, type DesignVariant } from './DesignVariants';
import { MessageSourceBadge, type MessageSource } from './MessageSourceBadge';
import { ZyraAvatar } from '@/components/ZyraAvatar';
import { useAppearance } from '@/hooks/useAppearance';

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
  source?: MessageSource;
  onApplyVariant?: (variant: DesignVariant, index: number) => void;
  onRegenerateVariants?: () => void;
  onCustomizeStore?: () => void;
}

export function ChatMessage({ role, content, attachments, designVariants, appliedVariantIndex, source, onApplyVariant, onRegenerateVariants, onCustomizeStore }: ChatMessageProps) {
  const isUser = role === 'user';
  const appearance = useAppearance();

  const bubbleClass = isUser ? {
    flat: 'group-[.is-user]:bg-transparent group-[.is-user]:text-foreground group-[.is-user]:px-0',
    rounded: 'rounded-2xl bg-primary text-primary-foreground',
    bubbles: 'rounded-[1.4rem] rounded-br-md bg-primary text-primary-foreground shadow-sm',
    outlined: 'rounded-xl border border-primary/20 group-[.is-user]:bg-transparent group-[.is-user]:text-foreground',
  }[appearance.bubbleStyle] : 'bg-transparent p-0';
  const filled = isUser && (appearance.bubbleStyle === 'rounded' || appearance.bubbleStyle === 'bubbles');

  return (
    <Message from={role} className="w-full max-w-none">
      <div className="max-w-3xl mx-auto w-full flex gap-3 px-4 py-5 md:px-6">
        {/* Avatar */}
        {isUser ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
        ) : (
          <ZyraAvatar />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn(
              'text-xs',
              isUser ? 'font-semibold' : 'font-bold tracking-tight',
              isUser ? 'text-foreground' : 'text-primary'
            )}>
              {isUser ? 'You' : 'ZYRA'}
            </p>
            {!isUser && source && <MessageSourceBadge source={source} />}
          </div>

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

          <MessageContent
            className={cn(
              'w-full max-w-none leading-relaxed text-[15px]',
              bubbleClass,
              filled
                ? 'text-primary-foreground [&_a]:text-primary-foreground [&_strong]:text-primary-foreground'
                : 'text-foreground'
            )}
          >
            <MessageResponse>{content}</MessageResponse>
          </MessageContent>

          {/* Design Variants */}
          {designVariants && designVariants.length > 0 && onApplyVariant && (
            <DesignVariants
              variants={designVariants}
              appliedIndex={appliedVariantIndex ?? null}
              onApply={onApplyVariant}
              onRegenerate={onRegenerateVariants}
              onCustomize={onCustomizeStore}
            />
          )}
        </div>
      </div>
    </Message>
  );
}
