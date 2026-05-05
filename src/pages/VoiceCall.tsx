import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Mic, Plus, X, Send, Square } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ preview: string; base64: string } | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const turnsRef = useRef<VoiceTurn[]>([]);
  const statusRef = useRef<CallStatus>('idle');
  turnsRef.current = turns;
  statusRef.current = status;

  const stats = getStoreStats();
  const lastAssistant = [...turns].reverse().find(t => t.role === 'assistant');

  const browserSpeak = useCallback((textToSay: string) => {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(textToSay);
      u.rate = 1.02;
      u.pitch = 1;
      u.onend = () => { if (statusRef.current !== 'ended') { setStatus('listening'); startListening(); } };
      synth.speak(u);
    } catch {
      setStatus('listening'); startListening();
    }
  }, []);

  const speak = useCallback(async (textToSay: string) => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    try {
      const { data, error } = await supabase.functions.invoke('voice-tts', { body: { text: textToSay } });
      if (error || !data?.audioContent) {
        // Edge function unavailable OR ElevenLabs flagged free tier — fall back to browser TTS
        browserSpeak(textToSay);
        return;
      }
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      audioRef.current = audio;
      audio.onended = () => {
        if (statusRef.current !== 'ended') { setStatus('listening'); startListening(); }
      };
      audio.onerror = () => browserSpeak(textToSay);
      await audio.play();
    } catch {
      browserSpeak(textToSay);
    }
  }, [browserSpeak]);

  const sendToAI = useCallback(async (userText: string, imageBase64?: string) => {
    setStatus('processing');
    const displayContent = imageBase64 ? `🖼️ ${userText || 'What do you think?'}` : userText;
    const userTurn: VoiceTurn = { id: crypto.randomUUID(), role: 'user', content: displayContent };
    setTurns(prev => [...prev, userTurn]);

    // Build API messages — most are plain text, but the latest may include an image
    const history = turnsRef.current.map(t => ({ role: t.role, content: t.content }));
    const latestContent: any = imageBase64
      ? [
          { type: 'text', text: userText || 'What do you see in this image?' },
          { type: 'image_url', image_url: { url: imageBase64 } },
        ]
      : userText;
    const apiMessages = [...history, { role: 'user', content: latestContent }];

    try {
      const lang = localStorage.getItem('salesbooster_language') || 'en';
      const { data, error } = await supabase.functions.invoke('voice-chat', {
        body: { messages: apiMessages, storeContext: stats, language: lang },
      });
      if (error) throw error;
      const reply = data?.reply || "Sorry, I didn't catch that.";
      setTurns(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply }]);
      setStatus('speaking');
      speak(reply);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reach AI');
      setStatus('listening'); startListening();
    }
  }, [speak, stats]);

  const startListening = useCallback(() => {
    const w = window as AnyWindow;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e: any) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      setPartial(interim);
      if (final.trim()) { setPartial(''); sendToAI(final.trim()); }
    };
    rec.onend = () => {
      if (statusRef.current === 'listening' && recognitionRef.current === rec) {
        try { rec.start(); } catch {}
      }
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch {}
  }, [sendToAI]);

  const startCall = async () => {
    try { await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { toast.error('Microphone permission required.'); return; }
    setStatus('connecting');
    setTurns([]);
    setTimeout(() => {
      const greeting = "Hey there! It's Zyra. How's your store doing today — anything you want to chat about?";
      setTurns([{ id: crypto.randomUUID(), role: 'assistant', content: greeting }]);
      setStatus('speaking');
      speak(greeting);
    }, 400);
  };

  const endCall = () => {
    setStatus('ended');
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    navigate(-1);
  };

  // Press-and-hold style mic button via input bar
  const toggleManualRecording = () => {
    const w = window as AnyWindow;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice input not supported. Try Chrome.'); return; }
    if (isRecording) { try { recognitionRef.current?.stop(); } catch {}; setIsRecording(false); return; }
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
      setText(prev => (finalText ? finalText : prev) + (interim ? ' ' + interim : ''));
    };
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    try { rec.start(); setIsRecording(true); } catch { setIsRecording(false); }
  };

  const submitText = () => {
    const t = text.trim();
    const img = pendingImage;
    if (!t && !img) return;
    setText('');
    setPendingImage(null);
    if (status === 'idle' || status === 'ended') {
      setStatus('processing');
      setTurns([]);
      setTimeout(() => sendToAI(t || 'Take a look at this image', img?.base64), 50);
    } else {
      sendToAI(t || 'Take a look at this image', img?.base64);
    }
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
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    if (audioRef.current) try { audioRef.current.pause(); } catch {}
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const isSpeaking = status === 'speaking';
  const isActive = status !== 'idle' && status !== 'ended';

  // Display text at top: latest assistant reply, or status hint
  const topText = lastAssistant?.content
    || (status === 'idle' ? 'Tap start to talk with Zyra' : status === 'connecting' ? 'Connecting…' : '');

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0b0420] via-[#1a0b3d] to-[#3b0d6b] text-white flex flex-col overflow-hidden">
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(60%_40%_at_50%_15%,rgba(139,92,246,0.25),transparent),radial-gradient(40%_40%_at_80%_80%,rgba(236,72,153,0.18),transparent)]" />
      {/* Top: AI response text */}
      <div className="relative flex-1 flex items-start justify-center pt-16 px-6 overflow-y-auto">
        <div className="max-w-2xl w-full text-center">
          {partial && (
            <p className="text-sm text-white/60 italic mb-4">"{partial}"</p>
          )}
          <p className="text-2xl md:text-3xl leading-relaxed font-light text-white tracking-tight">
            {topText}
          </p>
          {status === 'processing' && (
            <p className="text-sm text-white/60 mt-6 animate-pulse">Thinking…</p>
          )}
          {status === 'listening' && !partial && (
            <p className="text-sm text-white/60 mt-6">Listening…</p>
          )}
        </div>
      </div>

      {/* Center-bottom: animated blob */}
      <div className="relative flex flex-col items-center justify-center pb-2">
        {status === 'idle' || status === 'ended' ? (
          <button
            onClick={startCall}
            className="relative mb-8 group"
            aria-label="Start call"
          >
            <span className="absolute -inset-6 rounded-full bg-violet-400/30 blur-2xl group-hover:bg-violet-400/50 transition-colors" />
            <span
              className="relative block h-44 w-44 bg-[radial-gradient(circle_at_30%_30%,#c4b5fd,#7c3aed_55%,#4c1d95)] shadow-[0_20px_60px_-15px_rgba(124,58,237,0.6)]"
              style={{ animation: 'zyra-blob 4s ease-in-out infinite, zyra-blob-float 5s ease-in-out infinite' }}
            />
            <span
              className="absolute inset-6 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.6),transparent_60%)] pointer-events-none"
              style={{ animation: 'zyra-blob 4s ease-in-out infinite reverse' }}
            />
          </button>
        ) : (
          <div className="relative mb-8">
            <span className={cn(
              'absolute -inset-8 rounded-full blur-3xl transition-colors',
              isSpeaking ? 'bg-violet-500/40' : 'bg-violet-400/20',
            )} />
            <span
              className={cn(
                'relative block h-44 w-44 bg-[radial-gradient(circle_at_30%_30%,#c4b5fd,#7c3aed_55%,#4c1d95)] shadow-[0_20px_60px_-15px_rgba(124,58,237,0.7)]',
              )}
              style={{
                animation: isSpeaking
                  ? 'zyra-blob-speak 1.2s ease-in-out infinite, zyra-blob-float 3s ease-in-out infinite'
                  : 'zyra-blob 4s ease-in-out infinite, zyra-blob-float 5s ease-in-out infinite',
              }}
            />
            <span
              className="absolute inset-6 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.6),transparent_60%)] pointer-events-none"
              style={{ animation: 'zyra-blob 4s ease-in-out infinite reverse' }}
            />
          </div>
        )}
      </div>

      {/* Bottom: text input bar + end call */}
      <div className="relative px-4 pb-6 pt-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePicked}
        />
        {pendingImage && (
          <div className="max-w-2xl mx-auto mb-2 flex items-center gap-2">
            <div className="relative">
              <img src={pendingImage.preview} alt="attached" className="h-16 w-16 rounded-xl object-cover border border-neutral-200" />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-neutral-900 text-white flex items-center justify-center"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <span className="text-xs text-neutral-500">Image ready — add a message or tap send.</span>
          </div>
        )}
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full pl-2 pr-2 h-14 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition-colors"
              title="Send an image"
              aria-label="Send an image"
            >
              <Plus className="h-5 w-5" />
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitText(); } }}
              placeholder={pendingImage ? 'Add a message about the image…' : 'Message'}
              className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-neutral-400 text-neutral-900"
              dir="auto"
            />
            {(text.trim() || pendingImage) ? (
              <button
                onClick={submitText}
                className="h-10 w-10 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={toggleManualRecording}
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center transition-all',
                  isRecording
                    ? 'bg-violet-600 text-white animate-pulse'
                    : 'text-neutral-700 hover:bg-neutral-200'
                )}
                aria-label={isRecording ? 'Stop recording' : 'Record voice'}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
          </div>

          <button
            onClick={endCall}
            className="h-14 w-14 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-lg"
            aria-label="End call"
            title="End call"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {isActive && (
          <p className="text-center text-[11px] text-neutral-400 mt-3">
            {status === 'speaking' ? 'Zyra is speaking…' : status === 'listening' ? 'Listening — just speak' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
