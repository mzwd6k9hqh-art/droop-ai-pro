import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ImagePlus, X, Film, Pencil, Mic, Square, AudioWaveform } from 'lucide-react';
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
      <div
        className={cn(
          'flex flex-col rounded-2xl border border-border bg-background',
          'focus-within:border-primary/40 transition-colors'
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

        <div className="flex items-end gap-1 px-2 py-1.5">
          <div className="relative flex-1">
            <Pencil className="absolute left-3 top-[18px] h-4 w-4 text-muted-foreground/60 pointer-events-none" />
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask ZYRA anything..."
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full resize-none bg-transparent py-4 pr-2 pl-9 text-[15px] leading-snug',
                'placeholder:text-muted-foreground/60',
                'focus:outline-none disabled:opacity-50',
                'max-h-[200px] min-h-[52px]'
              )}
              dir="auto"
            />
          </div>
          <div className="flex items-center gap-0.5 p-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            {/* Image upload */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
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
                'h-9 w-9 rounded-full transition-colors',
                isRecording
                  ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={isRecording ? 'Stop recording' : 'Record voice message'}
              onClick={startVoiceInput}
              disabled={disabled}
            >
              {isRecording ? <Square className="h-[14px] w-[14px] fill-current" /> : <Mic className="h-[18px] w-[18px]" />}
            </Button>
            {/* Voice call — circular purple waveform button */}
            <button
              type="button"
              title="Start voice call with ZYRA"
              onClick={() => navigate('/voice-call')}
              className="h-9 w-9 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-colors shadow-sm"
            >
              <AudioWaveform className="h-[18px] w-[18px]" />
            </button>
            {/* Send */}
            <Button
              onClick={onSubmit}
              disabled={!hasContent || disabled}
              size="icon"
              className={cn(
                'h-9 w-9 rounded-full ml-0.5 transition-colors',
                hasContent
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground/60 hover:bg-muted'
              )}
            >
              <Send className="h-[16px] w-[16px]" />
            </Button>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
        ZYRA can make mistakes. Verify important information.
      </p>
    </div>
  );
}
