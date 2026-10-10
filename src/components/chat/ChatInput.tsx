import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ImagePlus, X, Film, Mic, Square, AudioWaveform, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit,
  PromptInputActionMenu, PromptInputActionMenuTrigger, PromptInputActionMenuContent,
  PromptInputActionMenuItem,
} from '@/components/ai-elements/prompt-input';

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
  const { language, t } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = {
    en: { actions: 'Add to chat', image: 'Upload image or video', voice: 'Voice message', call: 'Voice call', stop: 'Stop recording', recording: 'Listening…', remove: 'Remove attachment', notice: 'ZYRA can make mistakes. Verify important information.' },
    ar: { actions: 'إضافة للمحادثة', image: 'رفع صورة أو فيديو', voice: 'رسالة صوتية', call: 'محادثة صوتية', stop: 'إيقاف التسجيل', recording: 'جارٍ الاستماع…', remove: 'حذف المرفق', notice: 'قد تخطئ ZYRA. تحقق من المعلومات المهمة.' },
    fr: { actions: 'Ajouter au chat', image: 'Importer une image ou vidéo', voice: 'Message vocal', call: 'Appel vocal', stop: 'Arrêter l’enregistrement', recording: 'À l’écoute…', remove: 'Supprimer la pièce jointe', notice: 'ZYRA peut se tromper. Vérifiez les informations importantes.' },
  }[language];

  const startVoiceInput = () => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice input not supported. Try Chrome.'); return; }
    if (isRecording) { recognitionRef.current?.stop(); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
    let finalText = '';
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += text; else interim += text;
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

  useEffect(() => () => { recognitionRef.current?.abort(); }, []);
  useEffect(() => {
    if (disabled) recognitionRef.current?.stop();
  }, [disabled]);
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
  }, [value]);

  const hasContent = value.trim().length > 0 || attachments.length > 0;
  return (
    <div className="max-w-3xl mx-auto w-full px-3 md:px-6 pb-3">
      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
        onChange={e => { if (e.target.files?.length) onAddAttachments(e.target.files); e.target.value = ''; }} />
      {attachments.length > 0 && (
        <div className="flex gap-2 pb-3 flex-wrap">
          {attachments.map((att, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg border border-border bg-muted">
              {att.type === 'image' ? <img src={att.preview} alt={att.file.name} className="w-full h-full object-cover rounded-lg" /> :
                <div className="h-full flex items-center justify-center"><Film className="h-6 w-6 text-primary" /></div>}
              <Button type="button" variant="secondary" size="icon-xs" onClick={() => onRemoveAttachment(i)} aria-label={copy.remove}
                className="absolute -top-2 -right-2 border border-border shadow-sm"><X className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      )}
      <PromptInput className="chat-composer" onSubmit={() => { if (hasContent && !disabled) onSubmit(); }}>
        <PromptInputTextarea ref={textareaRef} value={value} onChange={e => onChange(e.target.value)}
          placeholder={t('ai.placeholder')} aria-label={t('ai.placeholder')} disabled={disabled} rows={1} dir="auto"
          className="min-h-[56px] max-h-[200px] w-full px-5 pt-4 pb-2 text-[15px] leading-relaxed placeholder:text-muted-foreground/70"
          onPaste={e => { if (e.clipboardData.files.length) { e.preventDefault(); onAddAttachments(e.clipboardData.files); } }} />
        <PromptInputFooter className="px-3 pb-3 pt-0">
          <div className="flex items-center gap-3 min-w-0">
            <PromptInputActionMenu open={menuOpen} onOpenChange={setMenuOpen}>
               <DropdownMenuTrigger asChild>
                 <Button type="button" variant="action" size="icon" aria-label={copy.actions} title={copy.actions} disabled={disabled}
                   className={cn('h-10 w-10 transition-transform', menuOpen && 'rotate-45')}>
                   <span className="text-xl leading-none">+</span>
                 </Button>
               </DropdownMenuTrigger>
              <PromptInputActionMenuContent side="top" align="start" sideOffset={12} className="w-64 rounded-xl p-2 border-border shadow-xl">
                <PromptInputActionMenuItem onSelect={() => fileInputRef.current?.click()} className="gap-3 rounded-lg p-3 cursor-pointer">
                  <span className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><ImagePlus className="h-4 w-4" /></span>
                  {copy.image}
                </PromptInputActionMenuItem>
                <PromptInputActionMenuItem onSelect={startVoiceInput} className="gap-3 rounded-lg p-3 cursor-pointer">
                  <span className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Mic className="h-4 w-4" /></span>
                  {isRecording ? copy.stop : copy.voice}
                </PromptInputActionMenuItem>
                <PromptInputActionMenuItem onSelect={() => navigate('/voice-call')} className="gap-3 rounded-lg p-3 cursor-pointer">
                  <span className="h-8 w-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><AudioWaveform className="h-4 w-4" /></span>
                  {copy.call}
                </PromptInputActionMenuItem>
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            {isRecording && (
              <Button type="button" variant="action" size="sm" onClick={() => recognitionRef.current?.stop()} aria-label={copy.stop} className="gap-2 text-xs">
                <Square className="h-3 w-3 fill-current" /><span className="motion-safe:animate-pulse">{copy.recording}</span>
              </Button>
            )}
          </div>
          <PromptInputSubmit status={disabled ? 'submitted' : 'ready'} disabled={!hasContent || disabled}
            variant="premium" aria-label={t('common.send')} title={t('common.send')} className="h-10 w-10 rounded-full p-0">
            {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
          </PromptInputSubmit>
        </PromptInputFooter>
      </PromptInput>
      <p className="text-[10px] text-muted-foreground text-center mt-3">{copy.notice}</p>
    </div>
  );
}
