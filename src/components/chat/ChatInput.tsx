import React, { useRef, useEffect } from 'react';
import { Send, ImagePlus, X, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ChatAttachment {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  attachments: ChatAttachment[];
  onAddAttachments: (files: FileList) => void;
  onRemoveAttachment: (index: number) => void;
}

export function ChatInput({ value, onChange, onSubmit, disabled, attachments, onAddAttachments, onRemoveAttachment }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachments.length > 0) && !disabled) onSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddAttachments(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pb-4">
      <div className={cn(
        'relative flex flex-col rounded-2xl border border-border bg-card shadow-lg transition-all',
        'focus-within:border-primary/40 focus-within:shadow-xl focus-within:ring-1 focus-within:ring-primary/20'
      )}>
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex gap-2 p-3 pb-0 flex-wrap">
            {attachments.map((att, i) => (
              <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted">
                {att.type === 'image' ? (
                  <img src={att.preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Film className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => onRemoveAttachment(i)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              title="إرفاق صورة أو فيديو"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
            <Button
              onClick={onSubmit}
              disabled={(!value.trim() && attachments.length === 0) || disabled}
              size="icon"
              className={cn(
                'h-8 w-8 rounded-lg transition-all',
                (value.trim() || attachments.length > 0)
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
        DROOB AI يمكنه ارتكاب أخطاء. تحقق من المعلومات المهمة.
      </p>
    </div>
  );
}
