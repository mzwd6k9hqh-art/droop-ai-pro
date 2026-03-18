import React, { useRef, useEffect } from 'react';
import { Send, Paperclip, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pb-4">
      <div className={cn(
        'relative flex items-end gap-2 rounded-2xl border border-border bg-card shadow-lg transition-all',
        'focus-within:border-primary/40 focus-within:shadow-xl focus-within:ring-1 focus-within:ring-primary/20'
      )}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالتك هنا..."
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent py-4 pr-4 pl-4 text-sm',
            'placeholder:text-muted-foreground/60',
            'focus:outline-none disabled:opacity-50',
            'max-h-[200px] min-h-[52px]'
          )}
          dir="auto"
        />
        <div className="flex items-center gap-1 p-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            title="بحث في الويب"
          >
            <Globe className="h-4 w-4" />
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!value.trim() || disabled}
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg transition-all',
              value.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
        DROOP AI يمكنه ارتكاب أخطاء. تحقق من المعلومات المهمة.
      </p>
    </div>
  );
}
