import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Mic, MicOff, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getStoreStats } from '@/lib/storeStats';
import { detectSpeechLanguage, initialSpeechLanguage } from '@/lib/speechLanguage';
import { loadPreferences } from '@/lib/preferences';
import { resolveModel } from '@/lib/aiModels';
import { useAuth } from '@/contexts/AuthContext';
import { readVoiceStream } from '@/lib/voiceStream';

type CallStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'ended';
interface VoiceTurn { id: string; role: 'user' | 'assistant'; content: string; }
type AnyWindow = Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any };

export default function VoiceCall() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<CallStatus>('idle');
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [partial, setPartial] = useState('');
  const [muted, setMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const turnsRef = useRef<VoiceTurn[]>([]);
  const statusRef = useRef<CallStatus>('idle');
  const mutedRef = useRef(false);
  const listenRef = useRef<() => void>(() => {});
  const speechLanguageRef = useRef(initialSpeechLanguage(localStorage.getItem('salesbooster_language') || 'en', navigator.language));
  const requestRef = useRef<AbortController | null>(null);
  const hasEnded = () => statusRef.current === 'ended';
  turnsRef.current = turns;
  statusRef.current = status;
  mutedRef.current = muted;

  const stats = getStoreStats();
  const lastUser = [...turns].reverse().find(t => t.role === 'user' && !t.content.startsWith('🖼️'));
  const isActive = status !== 'idle' && status !== 'ended';

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
      toast.error('Voice recognition needs Chrome, Edge or Safari.');
      return;
    }
    stopRecognition();
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = speechLanguageRef.current;

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
  const browserSpeak = useCallback(async (textToSay: string) => {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(textToSay);
      u.lang = speechLanguageRef.current;
      const preferred = synth.getVoices().find(v => v.lang.toLowerCase() === u.lang.toLowerCase())
        || synth.getVoices().find(v => v.lang.split('-')[0] === u.lang.split('-')[0]);
      if (preferred) u.voice = preferred;
      u.rate = 1.03;
      u.pitch = 1.05;
      u.onend = () => { if (statusRef.current !== 'ended') listenRef.current(); };
      u.onerror = () => { if (statusRef.current !== 'ended') listenRef.current(); };
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
    if (statusRef.current === 'processing' || statusRef.current === 'speaking' || statusRef.current === 'ended') return;
    stopRecognition();
    statusRef.current = 'processing';
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
      const controller = new AbortController();
      requestRef.current = controller;
      const model = resolveModel(loadPreferences().aiModel, Boolean(user && user.plan !== 'free'));
      const languageReady = detectSpeechLanguage(userText, speechLanguageRef.current).then(value => { speechLanguageRef.current = value; });
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-chat`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${sessionData.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [...history, { role: 'user', content: latestContent }], storeContext: stats, language: lang, model: model.id }),
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(failure.error || 'Failed to reach ZYRA');
      }
      await languageReady;
      const canStreamSpeech = 'speechSynthesis' in window && window.speechSynthesis.getVoices().some(voice => voice.lang.split('-')[0] === speechLanguageRef.current.split('-')[0]);
      let pending = '', streamFinished = false, queued = 0;
      const resume = () => { if (streamFinished && queued === 0 && statusRef.current !== 'ended') listenRef.current(); };
      const say = (text: string) => {
        if (!text.trim() || statusRef.current === 'ended') return;
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.lang = speechLanguageRef.current;
        utterance.voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase() === utterance.lang.toLowerCase()) || window.speechSynthesis.getVoices().find(v => v.lang.split('-')[0] === utterance.lang.split('-')[0]) || null;
        utterance.rate = model.name === 'Zero 1.6' ? 1.08 : 1.03;
        queued++;
        utterance.onstart = () => { if (statusRef.current !== 'ended') { statusRef.current = 'speaking'; setStatus('speaking'); } };
        utterance.onend = utterance.onerror = () => { queued--; resume(); };
        window.speechSynthesis.speak(utterance);
      };
      const streaming = response.headers.get('Content-Type')?.includes('text/event-stream');
      const reply = streaming ? await readVoiceStream(response, delta => {
        if (!canStreamSpeech) return;
        pending += delta;
        const match = pending.match(/^([\s\S]*?[.!?؟。](?:\s|$))/);
        if (match) { say(match[1]); pending = pending.slice(match[1].length); }
      }) : (await response.json()).reply;
      if (controller.signal.aborted || hasEnded()) return;
      setTurns(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply }]);
      if (canStreamSpeech && streaming) {
        say(pending);
        streamFinished = true;
        resume();
      } else {
        statusRef.current = 'speaking';
        setStatus('speaking');
        if (canStreamSpeech) browserSpeak(reply); else speak(reply);
      }
    } catch (e: any) {
      if (e?.name === 'AbortError' || hasEnded()) return;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      toast.error(e?.message || 'Failed to reach ZYRA');
      startListening();
    }
  }, [speak, browserSpeak, stats, user, startListening, stopRecognition]);
  const sendToAIRef = useRef(sendToAI);
  sendToAIRef.current = sendToAI;

  /* ---------------- call controls ---------------- */
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    }
    catch { toast.error('Microphone permission is required for a voice call.'); return; }
    setStatus('connecting');
    setTurns([]);
    startListening();
  };

  const endCall = () => {
    statusRef.current = 'ended';
    requestRef.current?.abort();
    setStatus('ended');
    stopRecognition();
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    navigate('/ai');
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

  const handleImagePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image too large (max 10MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      sendToAI('Take a look at this image', base64);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => () => {
    statusRef.current = 'ended';
    requestRef.current?.abort();
    if (recognitionRef.current) { try { recognitionRef.current.onend = null; recognitionRef.current.stop(); } catch {} }
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const isSpeaking = status === 'speaking';
  const isListening = status === 'listening';

  const caption = status === 'idle' ? 'Start call'
    : status === 'connecting' ? 'Connecting'
    : status === 'processing' ? 'Thinking'
    : status === 'speaking' ? 'Speaking'
    : muted ? 'Microphone muted' : 'Listening';

  return (
    <div className="fixed inset-0 grid grid-rows-[minmax(100px,1fr)_auto_minmax(120px,1fr)] overflow-hidden bg-background text-foreground">
      <div className="flex justify-center px-8 pt-12 sm:pt-16">
        <p dir="auto" aria-label="Your transcript" aria-live="polite" className="max-h-28 max-w-lg overflow-y-auto text-center text-sm font-normal leading-relaxed text-muted-foreground/80">
          {partial || lastUser?.content || ''}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center" role="img" aria-label={`ZYRA — ${caption}`}>
        <div className={cn('voice-circle relative h-56 w-56 sm:h-72 sm:w-72', isSpeaking && 'voice-circle-speaking', isListening && 'voice-circle-listening', status === 'processing' && 'voice-circle-thinking', muted && 'opacity-60')} aria-hidden="true">
          <span className="voice-circle-body absolute inset-4" />
          <span className="voice-circle-flow absolute inset-5" />
          <span className="voice-circle-pearl absolute inset-8" />
        </div>
        <span role="status" className="sr-only">{caption}</span>
      </div>

      <div className="flex items-end justify-center px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:pb-14">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePicked} />
        <div className="flex items-center gap-6 sm:gap-8">
          <Button type="button" variant="action" size="icon" onClick={() => fileInputRef.current?.click()} disabled={status === 'processing' || status === 'speaking' || status === 'connecting'} aria-label="Send an image" title="Send an image" className="h-12 w-12 border border-border bg-muted/70 text-primary hover:bg-secondary [&_svg]:size-5">
            <Plus />
          </Button>
          <Button type="button" variant={muted ? 'secondary' : 'premium'} size="icon" onClick={isActive ? toggleMute : startCall} aria-label={!isActive ? 'Start call' : muted ? 'Unmute microphone' : 'Mute microphone'} aria-pressed={isActive && muted} title={!isActive ? 'Start call' : muted ? 'Unmute microphone' : 'Mute microphone'} className="h-16 w-16 rounded-full [&_svg]:size-6">
            {muted ? <MicOff /> : <Mic />}
          </Button>
          <Button type="button" variant="action" size="icon" onClick={endCall} aria-label="End call" title="End call" className="h-12 w-12 border border-border bg-muted/70 text-muted-foreground hover:bg-secondary [&_svg]:size-5">
            <X />
          </Button>
        </div>
      </div>
    </div>
  );
}
