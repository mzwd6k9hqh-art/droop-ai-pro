import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Sparkles,
  ArrowLeft, BarChart3, Clock, MessageSquare, Activity, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type CallStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'ended';
interface VoiceTurn { id: string; role: 'user' | 'assistant'; content: string; at: number; }

// Browser SpeechRecognition typings
type AnyWindow = Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any };

export default function VoiceCall() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallStatus>('idle');
  const [muted, setMuted] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [partial, setPartial] = useState('');
  const [callStart, setCallStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const turnsRef = useRef<VoiceTurn[]>([]);
  turnsRef.current = turns;

  // Tick timer
  useEffect(() => {
    if (!callStart) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - callStart) / 1000)), 1000);
    return () => clearInterval(t);
  }, [callStart]);

  const speak = useCallback((text: string) => {
    if (silentMode || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setStatus('listening');
      startListening();
      return;
    }
    const synth = window.speechSynthesis;
    // Stop any active recognition so the mic doesn't pick up the AI's own voice
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    synth.cancel();

    const speakNow = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.pitch = 1;
      u.volume = 1;
      // Pick an English voice if available
      const voices = synth.getVoices();
      const preferred = voices.find(v => /en[-_]US/i.test(v.lang) && /female|samantha|google/i.test(v.name))
        || voices.find(v => /^en/i.test(v.lang))
        || voices[0];
      if (preferred) u.voice = preferred;
      u.onend = () => {
        setStatus('listening');
        startListening();
      };
      u.onerror = (ev: any) => {
        console.warn('TTS error', ev?.error);
        setStatus('listening');
        startListening();
      };
      synthRef.current = u;
      // Chrome quirk: resume if paused
      try { synth.resume(); } catch {}
      synth.speak(u);
    };

    // Voices may load asynchronously
    if (synth.getVoices().length === 0) {
      let fired = false;
      const handler = () => {
        if (fired) return;
        fired = true;
        synth.removeEventListener('voiceschanged', handler);
        speakNow();
      };
      synth.addEventListener('voiceschanged', handler);
      setTimeout(() => {
        if (fired) return;
        fired = true;
        try { synth.removeEventListener('voiceschanged', handler); } catch {}
        speakNow();
      }, 300);
    } else {
      speakNow();
    }
  }, [silentMode]);

  const sendToAI = useCallback(async (userText: string) => {
    setStatus('processing');
    const userTurn: VoiceTurn = { id: crypto.randomUUID(), role: 'user', content: userText, at: Date.now() };
    setTurns(prev => [...prev, userTurn]);

    const history = [...turnsRef.current, userTurn].map(t => ({ role: t.role, content: t.content }));
    try {
      const { data, error } = await supabase.functions.invoke('voice-chat', {
        body: { messages: history },
      });
      if (error) throw error;
      const reply = data?.reply || "Sorry, I didn't catch that.";
      const aiTurn: VoiceTurn = { id: crypto.randomUUID(), role: 'assistant', content: reply, at: Date.now() };
      setTurns(prev => [...prev, aiTurn]);
      setStatus('speaking');
      speak(reply);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reach AI');
      setStatus('listening');
      startListening();
    }
  }, [speak]);

  const startListening = useCallback(() => {
    const w = window as AnyWindow;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      toast.error('Voice recognition not supported in this browser. Try Chrome.');
      return;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setPartial(interim);
      if (final.trim()) {
        setPartial('');
        sendToAI(final.trim());
      }
    };
    rec.onerror = (e: any) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      console.warn('SpeechRecognition error', e.error);
    };
    rec.onend = () => {
      // Auto-restart if we're still in listening state
      if (status === 'listening' && !muted && recognitionRef.current === rec) {
        try { rec.start(); } catch {}
      }
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch {}
  }, [sendToAI, muted, status]);

  const startCall = async () => {
    try {
      // Prompt mic permission early
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error('Microphone permission is required for voice calls.');
      return;
    }
    setStatus('connecting');
    setCallStart(Date.now());
    setElapsed(0);
    setTurns([]);
    setTimeout(() => {
      const greeting = "Hi! I'm DROOB AI. How can I help your store today?";
      const aiTurn: VoiceTurn = { id: crypto.randomUUID(), role: 'assistant', content: greeting, at: Date.now() };
      setTurns([aiTurn]);
      setStatus('speaking');
      speak(greeting);
    }, 600);
  };

  const endCall = () => {
    setStatus('ended');
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const toggleMute = () => {
    setMuted(m => {
      const next = !m;
      if (next && recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      } else if (!next && status === 'listening') {
        startListening();
      }
      return next;
    });
  };

  // Cleanup on unmount
  useEffect(() => () => {
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  // Insights
  const userTurns = turns.filter(t => t.role === 'user');
  const avgWords = userTurns.length
    ? Math.round(userTurns.reduce((a, t) => a + t.content.split(/\s+/).length, 0) / userTurns.length)
    : 0;
  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const orbColor =
    status === 'speaking' ? 'from-emerald-400 to-teal-500' :
    status === 'listening' ? 'from-primary to-accent' :
    status === 'processing' ? 'from-amber-400 to-orange-500' :
    status === 'ended' ? 'from-muted to-muted' :
    'from-primary/60 to-accent/60';

  const statusLabel = {
    idle: 'Ready to call',
    connecting: 'Connecting...',
    listening: 'Listening...',
    processing: 'Thinking...',
    speaking: 'Speaking...',
    ended: 'Call ended',
  }[status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Top bar */}
      <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          DROOB AI Voice Call
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 grid lg:grid-cols-[1fr_360px] gap-6 pb-10">
        {/* Call orb */}
        <div className="elevated-card p-8 flex flex-col items-center justify-between min-h-[60vh]">
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">{statusLabel}</p>
            {callStart && <p className="text-2xl font-mono font-semibold">{fmtTime(elapsed)}</p>}
          </div>

          <div className="relative my-8">
            <div className={cn(
              'h-56 w-56 rounded-full bg-gradient-to-br shadow-2xl transition-all duration-500',
              orbColor,
              (status === 'listening' || status === 'speaking') && 'animate-pulse',
            )} />
            <div className={cn(
              'absolute inset-0 rounded-full border-4 border-white/20',
              status === 'listening' && 'animate-ping',
            )} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-16 w-16 text-white/90" />
            </div>
          </div>

          {/* Live transcript */}
          <div className="w-full max-w-md text-center min-h-[60px]">
            {partial && (
              <p className="text-sm text-muted-foreground italic">"{partial}"</p>
            )}
            {!partial && turns.length > 0 && (
              <p className="text-sm text-foreground/80 line-clamp-3">
                {turns[turns.length - 1].role === 'assistant' ? '🤖 ' : '🗣️ '}
                {turns[turns.length - 1].content}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-6">
            {status === 'idle' || status === 'ended' ? (
              <Button size="lg" onClick={startCall} className="gap-2 rounded-full px-8 h-14 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Phone className="h-5 w-5" />
                {status === 'ended' ? 'Call Again' : 'Start Call'}
              </Button>
            ) : (
              <>
                <Button
                  size="icon"
                  variant={muted ? 'destructive' : 'secondary'}
                  onClick={toggleMute}
                  className="h-14 w-14 rounded-full"
                  title={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  size="icon"
                  onClick={endCall}
                  className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90"
                  title="End call"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setSilentMode(s => !s)}
                  className="h-14 w-14 rounded-full"
                  title={silentMode ? 'Enable AI voice' : 'Mute AI voice'}
                >
                  {silentMode ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Insights panel */}
        <div className="space-y-4">
          <div className="elevated-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Live Call Insights</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat icon={Clock} label="Duration" value={fmtTime(elapsed)} />
              <Stat icon={MessageSquare} label="Turns" value={String(turns.length)} />
              <Stat icon={Activity} label="You spoke" value={`${userTurns.length}x`} />
              <Stat icon={TrendingUp} label="Avg words" value={String(avgWords)} />
            </div>
          </div>

          <div className="elevated-card p-5 max-h-[40vh] overflow-y-auto">
            <h3 className="font-semibold mb-3 text-sm">Conversation log</h3>
            {turns.length === 0 ? (
              <p className="text-xs text-muted-foreground">Start a call to see the live transcript.</p>
            ) : (
              <div className="space-y-3">
                {turns.map(t => (
                  <div key={t.id} className={cn('text-sm', t.role === 'user' ? 'text-foreground' : 'text-primary')}>
                    <span className="text-[10px] uppercase tracking-wide opacity-60 block mb-0.5">
                      {t.role === 'user' ? 'You' : 'DROOB AI'}
                    </span>
                    {t.content}
                  </div>
                ))}
              </div>
            )}
          </div>

          {status === 'ended' && turns.length > 1 && (
            <div className="elevated-card p-5 bg-gradient-to-br from-emerald-500/10 to-primary/10 border-primary/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" /> Call Summary
              </h3>
              <p className="text-sm text-muted-foreground">
                You had a {fmtTime(elapsed)} conversation with {turns.length} turns. You asked {userTurns.length} question{userTurns.length === 1 ? '' : 's'} averaging {avgWords} words each. 
                {avgWords > 15 ? ' You provided detailed context — great for personalised AI replies!' : ' Try giving more detail next time for richer answers.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
