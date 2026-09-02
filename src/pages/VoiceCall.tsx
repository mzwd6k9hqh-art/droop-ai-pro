import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Mic, MicOff, Plus, X, Send, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getStoreStats } from '@/lib/storeStats';

type CallStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'ended';
interface VoiceTurn { id: string; role: 'user' | 'assistant'; content: string; }
type AnyWindow = Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any };

export default function VoiceCall() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallStatus>('idle');
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [partial, setPartial] = useState('');
  const [text, setText] = useState('');
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [pendingImage, setPendingImage] = useState<{ preview: string; base64: string } | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const turnsRef = useRef<VoiceTurn[]>([]);
  const statusRef = useRef<CallStatus>('idle');
  const mutedRef = useRef(false);
  const listenRef = useRef<() => void>(() => {});
  turnsRef.current = turns;
  statusRef.current = status;
  mutedRef.current = muted;

  const stats = getStoreStats();
  const lastAssistant = [...turns].reverse().find(t => t.role === 'assistant');
  const isActive = status !== 'idle' && status !== 'ended';

  /* ---------------- timer ---------------- */
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  /* ---------------- listening ---------------- */
  const stopRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) { try { rec.onend = null; rec.stop(); } catch {} }
  }, []);

  const startListening = useCallback(() => {
    if (mutedRef.current || statusRef.current === 'ended') return;
    const w = window as AnyWindow;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      toast.error('Voice recognition needs Chrome, Edge or Safari. You can still type.');
      return;
    }
    stopRecognition();
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: any) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      setPartial(interim);
      if (final.trim()) {
        setPartial('');
        stopRecognition();
        sendToAIRef.current(final.trim());
      }
    };
    rec.onerror = (ev: any) => {
      if (ev?.error === 'not-allowed' || ev?.error === 'service-not-allowed') {
        toast.error('Microphone access denied');
        setStatus('ended');
      }
    };
    rec.onend = () => {
      // keep the mic warm while we are in the listening phase
      if (statusRef.current === 'listening' && !mutedRef.current && recognitionRef.current === rec) {
        try { rec.start(); } catch {}
      }
    };
    recognitionRef.current = rec;
    setStatus('listening');
    try { rec.start(); } catch {}
  }, [stopRecognition]);
  listenRef.current = startListening;

  /* ---------------- speaking ---------------- */
  const browserSpeak = useCallback((textToSay: string) => {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(textToSay);
      const preferred = synth.getVoices().find(v => /samantha|google us english|female|zira/i.test(v.name));
      if (preferred) u.voice = preferred;
      u.rate = 1.03;
      u.pitch = 1.05;
      u.onend = () => { if (statusRef.current !== 'ended') listenRef.current(); };
      synth.speak(u);
    } catch {
      listenRef.current();
    }
  }, []);

  const speak = useCallback(async (textToSay: string) => {
    stopRecognition();
    try {
      const { data, error } = await supabase.functions.invoke('voice-tts', { body: { text: textToSay } });
      if (error || !data?.audioContent) { browserSpeak(textToSay); return; }
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      audioRef.current = audio;
      audio.onended = () => { if (statusRef.current !== 'ended') listenRef.current(); };
      audio.onerror = () => browserSpeak(textToSay);
      await audio.play();
    } catch {
      browserSpeak(textToSay);
    }
  }, [browserSpeak, stopRecognition]);

  /* ---------------- AI turn ---------------- */
  const sendToAI = useCallback(async (userText: string, imageBase64?: string) => {
    stopRecognition();
    setStatus('processing');
    const displayContent = imageBase64 ? `🖼️ ${userText || 'What do you think?'}` : userText;
    setTurns(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: displayContent }]);

    const history = turnsRef.current.map(t => ({ role: t.role, content: t.content }));
    const latestContent: any = imageBase64
      ? [
          { type: 'text', text: userText || 'What do you see in this image?' },
          { type: 'image_url', image_url: { url: imageBase64 } },
        ]
      : userText;

    try {
      const lang = localStorage.getItem('salesbooster_language') || 'en';
      const { data, error } = await supabase.functions.invoke('voice-chat', {
        body: { messages: [...history, { role: 'user', content: latestContent }], storeContext: stats, language: lang },
      });
      if (error) throw error;
      const reply = data?.reply || "Sorry, I didn't catch that.";
      setTurns(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply }]);
      setStatus('speaking');
      speak(reply);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reach ZYRA');
      startListening();
    }
  }, [speak, stats, startListening, stopRecognition]);
  const sendToAIRef = useRef(sendToAI);
  sendToAIRef.current = sendToAI;

  /* ---------------- call controls ---------------- */
  const startCall = async () => {
    try { await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { toast.error('Microphone permission is required for a voice call.'); return; }
    setStatus('connecting');
    setTurns([]);
    setSeconds(0);
    setTimeout(() => {
      const greeting = "Hey! It's ZYRA. How's your store doing today — what should we work on?";
      setTurns([{ id: crypto.randomUUID(), role: 'assistant', content: greeting }]);
      setStatus('speaking');
      speak(greeting);
    }, 500);
  };

  const endCall = () => {
    setStatus('ended');
    stopRecognition();
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    navigate(-1);
  };

  const toggleMute = () => {
    setMuted(m => {
      const next = !m;
      mutedRef.current = next;
      if (next) { stopRecognition(); setPartial(''); }
      else if (statusRef.current !== 'speaking' && statusRef.current !== 'processing') startListening();
      return next;
    });
  };

  const submitText = () => {
    const t = text.trim();
    const img = pendingImage;
    if (!t && !img) return;
    setText('');
    setPendingImage(null);
    if (status === 'idle' || status === 'ended') setTurns([]);
    sendToAI(t || 'Take a look at this image', img?.base64);
  };

  const handleImagePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image too large (max 10MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPendingImage({ preview: base64, base64 });
      toast.success('Image attached — add a message or send');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => () => {
    statusRef.current = 'ended';
    if (recognitionRef.current) { try { recognitionRef.current.onend = null; recognitionRef.current.stop(); } catch {} }
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const isSpeaking = status === 'speaking';
  const isListening = status === 'listening';

  const caption =
    status === 'idle' ? 'Tap the orb to start talking with ZYRA'
    : status === 'connecting' ? 'Connecting…'
    : status === 'processing' ? 'Thinking…'
    : status === 'speaking' ? 'ZYRA is speaking'
    : muted ? 'Microphone muted'
    : 'Listening — just speak';

  const topText = lastAssistant?.content || (status === 'idle' ? 'Talk to ZYRA about your store, your sales, anything.' : '');

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground">
      {/* soft ambient wash */}
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(55%_45%_at_50%_18%,hsl(var(--primary)/0.14),transparent_70%),radial-gradient(45%_40%_at_80%_85%,hsl(var(--accent)/0.12),transparent_70%)]" />

      {/* header */}
      <div className="relative flex items-center justify-between px-5 pt-5">
        <span className="text-sm font-bold tracking-tight">ZYRA</span>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium tabular-nums text-muted-foreground">
          {isActive ? clock : 'Voice call'}
        </span>
      </div>

      {/* transcript */}
      <div className="relative flex flex-1 items-end justify-center px-6 pb-6 pt-8">
        <div className="w-full max-w-xl text-center">
          {partial && <p className="mb-4 text-sm italic text-muted-foreground">"{partial}"</p>}
          <p className="text-2xl font-light leading-relaxed tracking-tight md:text-3xl">{topText}</p>
        </div>
      </div>

      {/* liquid blob */}
      <div className="relative flex flex-col items-center justify-center">
        <button
          onClick={status === 'idle' || status === 'ended' ? startCall : undefined}
          aria-label={isActive ? 'ZYRA' : 'Start call'}
          className={cn('relative h-52 w-52', isActive ? 'cursor-default' : 'cursor-pointer')}
          style={{ animation: 'zyra-liquid-float 6s ease-in-out infinite' }}
        >
          {/* pulsing rings while listening */}
          {isListening && !muted && [0, 1, 2].map(i => (
            <span
              key={i}
              className="absolute inset-4 rounded-full border border-primary/40"
              style={{ animation: `zyra-ring 2.6s ease-out ${i * 0.85}s infinite` }}
            />
          ))}

          <span className="absolute inset-0 rounded-full bg-primary/25 blur-3xl" />

          {/* layered liquid metaballs */}
          <span
            className="absolute inset-4 bg-[radial-gradient(circle_at_30%_28%,#ddd6fe,#8b5cf6_52%,#4c1d95)] blur-[1px]"
            style={{ animation: `zyra-liquid-a ${isSpeaking ? '3s' : '9s'} ease-in-out infinite` }}
          />
          <span
            className="absolute inset-8 bg-[radial-gradient(circle_at_70%_65%,rgba(255,255,255,0.85),rgba(167,139,250,0.55)_45%,transparent_72%)] mix-blend-screen"
            style={{ animation: `zyra-liquid-b ${isSpeaking ? '2.2s' : '7s'} ease-in-out infinite` }}
          />
          <span
            className="absolute inset-12 bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.9),transparent_65%)] opacity-70"
            style={{ animation: `zyra-liquid-a ${isSpeaking ? '1.6s' : '5s'} ease-in-out infinite reverse` }}
          />
        </button>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{caption}</p>
      </div>

      {/* controls */}
      <div className="relative px-4 pb-8 pt-8">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePicked} />

        {pendingImage && (
          <div className="mx-auto mb-3 flex max-w-xl items-center gap-2">
            <div className="relative">
              <img src={pendingImage.preview} alt="attached" className="h-16 w-16 rounded-xl border border-border object-cover" />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">Image ready — add a message or tap send.</span>
          </div>
        )}

        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="flex h-14 flex-1 items-center gap-2 rounded-full border border-border/70 bg-card/70 px-2 shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Send an image"
            >
              <Plus className="h-5 w-5" />
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitText(); } }}
              placeholder={pendingImage ? 'Add a message about the image…' : 'Or type a message'}
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
              dir="auto"
            />
            {(text.trim() || pendingImage) && (
              <button
                onClick={submitText}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={toggleMute}
            disabled={!isActive}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full border border-border/70 transition-colors disabled:opacity-40',
              muted ? 'bg-muted text-muted-foreground' : 'bg-card text-foreground hover:bg-muted'
            )}
            aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <button
            onClick={endCall}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-opacity hover:opacity-90"
            aria-label="End call"
          >
            <Phone className="h-5 w-5 rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
}
