import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ImagePlus, X, Film, Pencil, PhoneCall, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startVoiceInput = () => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice input not supported. Try Chrome.'); return; }
    if (isRecording) { recognitionRef.current?.stop(); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    let finalText = '';
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      onChange((value ? value + ' ' : '') + finalText + interim);
    };
    rec.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') toast.error('Voice input error');
      setIsRecording(false);
    };
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    try { rec.start(); setIsRecording(true); } catch { setIsRecording(false); }
  };

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

  const hasContent = value.trim().length > 0 || attachments.length > 0;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pb-4">
      {/* Gradient glow wrapper */}
      <div className="relative group">
        {/* Animated gradient border / glow */}
        <div
          className={cn(
            'absolute -inset-[1.5px] rounded-[28px] opacity-60 blur-[2px] transition-all duration-500',
            'bg-[linear-gradient(120deg,hsl(var(--primary))_0%,hsl(var(--accent))_45%,hsl(var(--secondary))_100%)]',
            'group-focus-within:opacity-100 group-focus-within:blur-[6px]',
            hasContent && 'opacity-100 blur-[6px]'
          )}
        />

        <div
          className={cn(
            'relative flex flex-col rounded-[26px] border border-white/40 dark:border-white/10',
            'bg-card/70 backdrop-blur-xl',
            'shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.25)]',
            'transition-all duration-300'
          )}
        >
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex gap-2 p-3 pb-0 flex-wrap">
              {attachments.map((att, i) => (
                <div key={i} className="relative group/att w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted">
                  {att.type === 'image' ? (
                    <img src={att.preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Film className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    onClick={() => onRemoveAttachment(i)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/att:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 px-2 py-1.5">
            <div className="relative flex-1">
              <Pencil className="absolute left-4 top-[22px] h-4 w-4 text-primary/50 pointer-events-none" />
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask DROOB AI anything..."
                disabled={disabled}
                rows={1}
                className={cn(
                  'w-full resize-none bg-transparent py-5 pr-2 pl-11 text-[15px] leading-snug',
                  'placeholder:text-muted-foreground/50',
                  'focus:outline-none disabled:opacity-50',
                  'max-h-[200px] min-h-[60px]'
                )}
                dir="auto"
              />
            </div>
            <div className="flex items-center gap-1.5 p-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              {/* Image upload — polished glass button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-full',
                  'bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20',
                  'border border-primary/20 hover:border-primary/40',
                  'text-primary transition-all duration-200 hover:scale-105'
                )}
                title="Attach image or video"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                <ImagePlus className="h-[18px] w-[18px]" />
              </Button>
              {/* Voice message — record speech to text */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-full transition-all duration-200 hover:scale-105',
                  isRecording
                    ? 'bg-rose-500 text-white border border-rose-300 shadow-[0_0_18px_-2px_hsl(0_84%_60%/0.7)] animate-pulse'
                    : 'bg-gradient-to-br from-rose-400/15 to-pink-500/15 hover:from-rose-400/25 hover:to-pink-500/25 border border-rose-400/30 hover:border-rose-400/50 text-rose-500 dark:text-rose-400'
                )}
                title={isRecording ? 'Stop recording' : 'Record voice message'}
                onClick={startVoiceInput}
                disabled={disabled}
              >
                {isRecording ? <Square className="h-[16px] w-[16px] fill-current" /> : <Mic className="h-[18px] w-[18px]" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-full relative',
                  'bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 hover:from-emerald-400/30 hover:to-emerald-600/30',
                  'border border-emerald-500/40 hover:border-emerald-500/60',
                  'text-emerald-600 dark:text-emerald-400',
                  'shadow-[0_0_18px_-4px_hsl(158_64%_45%/0.6)] hover:shadow-[0_0_24px_-2px_hsl(158_64%_45%/0.8)]',
                  'transition-all duration-200 hover:scale-105'
                )}
                title="Start voice call with DROOB AI"
                onClick={() => navigate('/voice-call')}
              >
                <PhoneCall className="h-[18px] w-[18px]" />
              </Button>
              {/* Send — glowing gradient when active */}
              <Button
                onClick={onSubmit}
                disabled={!hasContent || disabled}
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-full transition-all duration-300',
                  hasContent
                    ? 'bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--accent))_100%)] text-white shadow-[0_0_22px_-2px_hsl(var(--primary)/0.7)] hover:shadow-[0_0_30px_0_hsl(var(--primary)/0.9)] hover:scale-110'
                    : 'bg-muted text-muted-foreground/60 hover:bg-muted'
                )}
              >
                <Send className={cn('h-[18px] w-[18px] transition-transform', hasContent && 'translate-x-[1px]')} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground/50 text-center mt-2.5">
        DROOB AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}

