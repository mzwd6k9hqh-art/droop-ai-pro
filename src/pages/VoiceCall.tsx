import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Sparkles,
  ArrowLeft, Clock, MessageSquare, DollarSign, ShoppingBag,
  TrendingUp, Eye, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getStoreStats, fmtMoney } from '@/lib/storeStats';

type CallStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'ended';
interface VoiceTurn { id: string; role: 'user' | 'assistant'; content: string; at: number; }
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const turnsRef = useRef<VoiceTurn[]>([]);
  const statusRef = useRef<CallStatus>('idle');
  turnsRef.current = turns;
  statusRef.current = status;

  const stats = getStoreStats();

  useEffect(() => {
    if (!callStart || status === 'ended') return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - callStart) / 1000)), 1000);
    return () => clearInterval(t);
  }, [callStart, status]);

  // ---------- TTS via ElevenLabs ----------
  const speak = useCallback(async (text: string) => {
    if (silentMode) {
      setStatus('listening');
      startListening();
      return;
    }
    // Stop mic so we don't pick up our own voice
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    try {
      const { data, error } = await supabase.functions.invoke('voice-tts', { body: { text } });
      if (error) throw error;
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        if (statusRef.current !== 'ended') {
          setStatus('listening');
          startListening();
        }
      };
      audio.onerror = () => {
        if (statusRef.current !== 'ended') {
          setStatus('listening');
          startListening();
        }
      };
      await audio.play();
    } catch (e: any) {
      console.warn('TTS failed, falling back', e);
      // Fallback to browser TTS
      try {
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.onend = () => { if (statusRef.current !== 'ended') { setStatus('listening'); startListening(); } };
        synth.speak(u);
      } catch {
        setStatus('listening');
        startListening();
      }
    }
  }, [silentMode]);

  // ---------- AI ----------
  const sendToAI = useCallback(async (userText: string) => {
    setStatus('processing');
    const userTurn: VoiceTurn = { id: crypto.randomUUID(), role: 'user', content: userText, at: Date.now() };
    setTurns(prev => [...prev, userTurn]);

    const history = [...turnsRef.current, userTurn].map(t => ({ role: t.role, content: t.content }));
    try {
      const { data, error } = await supabase.functions.invoke('voice-chat', {
        body: { messages: history, storeContext: stats },
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
  }, [speak, stats]);

  // ---------- STT ----------
  const startListening = useCallback(() => {
    const w = window as AnyWindow;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice recognition not supported. Try Chrome.'); return; }
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
    rec.onerror = (e: any) => { if (e.error !== 'no-speech' && e.error !== 'aborted') console.warn('SR error', e.error); };
    rec.onend = () => {
      if (statusRef.current === 'listening' && !muted && recognitionRef.current === rec) {
        try { rec.start(); } catch {}
      }
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch {}
  }, [sendToAI, muted]);

  const startCall = async () => {
    try { await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { toast.error('Microphone permission required.'); return; }
    setStatus('connecting');
    setCallStart(Date.now());
    setElapsed(0);
    setTurns([]);
    setTimeout(() => {
      const greeting = "Hey there! It's DROOB. How's the store doing today — anything you wanna chat about?";
      const aiTurn: VoiceTurn = { id: crypto.randomUUID(), role: 'assistant', content: greeting, at: Date.now() };
      setTurns([aiTurn]);
      setStatus('speaking');
      speak(greeting);
    }, 600);
  };

  const endCall = () => {
    setStatus('ended');
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const toggleMute = () => {
    setMuted(m => {
      const next = !m;
      if (next && recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
      else if (!next && status === 'listening') startListening();
      return next;
    });
  };

  useEffect(() => () => {
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    if (audioRef.current) try { audioRef.current.pause(); } catch {}
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const userTurns = turns.filter(t => t.role === 'user');
  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const isActive = status !== 'idle' && status !== 'ended';
  const statusLabel = {
    idle: 'Tap to call', connecting: 'Connecting…', listening: 'Listening…',
    processing: 'Thinking…', speaking: 'Speaking…', ended: 'Call ended',
  }[status];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top,#1a0b3d_0%,#0a0518_50%,#000000_100%)] text-white">
      {/* Animated ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 left-1/3 h-[450px] w-[450px] rounded-full bg-fuchsia-600/15 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top bar */}
      <div className="relative container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-white/80 hover:text-white hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Sparkles className="h-4 w-4 text-fuchsia-400" />
          DROOB AI · Voice Call
        </div>
      </div>

      <div className="relative container max-w-6xl mx-auto px-4 grid lg:grid-cols-[1fr_380px] gap-6 pb-10">
        {/* Call screen */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 flex flex-col items-center justify-between min-h-[70vh] shadow-[0_8px_60px_-12px_rgba(124,58,237,0.4)]">
          <div className="text-center space-y-1.5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">DROOB AI</p>
            <p className="text-sm text-white/70">{statusLabel}</p>
            {callStart && (
              <p className="text-3xl font-mono font-light text-white tabular-nums mt-2 flex items-center justify-center gap-2">
                <span className={cn('h-2 w-2 rounded-full bg-emerald-400', isActive && 'animate-pulse')} />
                {fmtTime(elapsed)}
              </p>
            )}
          </div>

          {/* Avatar with pulsing rings */}
          <div className="relative my-10 flex items-center justify-center">
            {/* Outer pulsing rings */}
            {isActive && (
              <>
                <span className="absolute h-[280px] w-[280px] rounded-full border border-fuchsia-400/30 animate-ping" style={{ animationDuration: '2.5s' }} />
                <span className="absolute h-[340px] w-[340px] rounded-full border border-purple-400/20 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.4s' }} />
                <span className="absolute h-[400px] w-[400px] rounded-full border border-indigo-400/10 animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.8s' }} />
              </>
            )}

            {/* Sound wave bars (when speaking) */}
            {status === 'speaking' && (
              <div className="absolute -bottom-10 flex items-end gap-1 h-10">
                {[...Array(7)].map((_, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-fuchsia-500 to-purple-300"
                    style={{
                      animation: `wave 1s ease-in-out ${i * 0.1}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Main orb */}
            <div className={cn(
              'relative h-56 w-56 rounded-full bg-gradient-to-br shadow-[0_0_80px_-10px_rgba(217,70,239,0.6)] transition-all duration-700',
              status === 'speaking' && 'from-fuchsia-400 via-purple-500 to-indigo-600 scale-105',
              status === 'listening' && 'from-emerald-400 via-teal-500 to-cyan-600',
              status === 'processing' && 'from-amber-400 via-orange-500 to-rose-500',
              (status === 'idle' || status === 'ended') && 'from-purple-500/60 via-fuchsia-500/60 to-indigo-600/60',
              status === 'connecting' && 'from-purple-400 to-indigo-600 animate-pulse',
            )}>
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-20 w-20 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
          </div>

          {/* Live transcript */}
          <div className="w-full max-w-md text-center min-h-[60px]">
            {partial && <p className="text-sm text-white/60 italic">"{partial}"</p>}
            {!partial && turns.length > 0 && (
              <p className="text-sm text-white/85 line-clamp-3 leading-relaxed">
                {turns[turns.length - 1].role === 'assistant' ? '🤖 ' : '🗣️ '}
                {turns[turns.length - 1].content}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-8">
            {status === 'idle' || status === 'ended' ? (
              <button
                onClick={startCall}
                className="relative group"
              >
                <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-400 via-fuchsia-500 to-purple-500 opacity-75 blur-lg group-hover:opacity-100 group-hover:blur-xl transition-all animate-pulse" />
                <span className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-10 h-16 font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 transition-transform">
                  <Phone className="h-5 w-5" />
                  {status === 'ended' ? 'Call Again' : 'Start Call'}
                </span>
              </button>
            ) : (
              <>
                <Button size="icon" onClick={toggleMute}
                  className={cn('h-14 w-14 rounded-full backdrop-blur-md border border-white/20',
                    muted ? 'bg-rose-500/80 hover:bg-rose-500' : 'bg-white/10 hover:bg-white/20 text-white')}
                  title={muted ? 'Unmute' : 'Mute'}>
                  {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <button onClick={endCall} className="relative group" title="End call">
                  <span className="absolute -inset-1 rounded-full bg-rose-500 opacity-75 blur-md group-hover:opacity-100" />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_0_25px_rgba(244,63,94,0.6)] hover:scale-110 transition-transform">
                    <PhoneOff className="h-6 w-6 text-white" />
                  </span>
                </button>
                <Button size="icon" onClick={() => setSilentMode(s => !s)}
                  className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20"
                  title={silentMode ? 'Enable AI voice' : 'Mute AI voice'}>
                  {silentMode ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Insights panel — REAL store data */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-fuchsia-400" />
              <h3 className="font-semibold text-white">Live Store Insights</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DarkStat icon={DollarSign} label="Revenue (30d)" value={fmtMoney(stats.revenue30d)} color="emerald" />
              <DarkStat icon={Star} label="Net Profit" value={fmtMoney(stats.netProfit30d)} color="amber" />
              <DarkStat icon={ShoppingBag} label="Orders" value={String(stats.orders)} color="fuchsia" />
              <DarkStat icon={Eye} label="Store Views" value={stats.views30d.toLocaleString()} color="indigo" />
            </div>
            <div className="mt-3 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-400/20 p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/50">Top product</p>
              <p className="text-sm font-semibold text-white mt-0.5">{stats.topProduct.name}</p>
              <p className="text-xs text-white/60 mt-0.5">
                {fmtMoney(stats.topProduct.revenue)} · {stats.topProduct.units} units
              </p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/5 border border-white/10 p-2">
                <span className="text-white/50">Conversion</span>
                <p className="font-semibold text-white">{stats.conversion}%</p>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-2">
                <span className="text-white/50">Avg order</span>
                <p className="font-semibold text-white">{fmtMoney(stats.avgOrderValue)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-emerald-400" />
              <h3 className="font-semibold text-sm text-white">Call activity</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/5 p-2">
                <span className="text-white/50">Duration</span>
                <p className="font-mono text-white">{fmtTime(elapsed)}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-2">
                <span className="text-white/50">Turns</span>
                <p className="font-semibold text-white flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {turns.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 max-h-[35vh] overflow-y-auto">
            <h3 className="font-semibold mb-3 text-sm text-white">Conversation log</h3>
            {turns.length === 0 ? (
              <p className="text-xs text-white/40">Start a call to see the live transcript.</p>
            ) : (
              <div className="space-y-3">
                {turns.map(t => (
                  <div key={t.id} className="text-sm">
                    <span className={cn('text-[10px] uppercase tracking-wide block mb-0.5',
                      t.role === 'user' ? 'text-emerald-300/70' : 'text-fuchsia-300/70')}>
                      {t.role === 'user' ? 'You' : 'DROOB AI'}
                    </span>
                    <span className="text-white/90">{t.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {status === 'ended' && turns.length > 1 && (
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 to-fuchsia-500/15 backdrop-blur-xl border border-fuchsia-400/30 p-5">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4 text-emerald-300" /> Call Summary
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {fmtTime(elapsed)} call · {turns.length} turns · you asked {userTurns.length} question{userTurns.length === 1 ? '' : 's'}.
                Discussed your {fmtMoney(stats.revenue30d)} in 30-day revenue and top product "{stats.topProduct.name}".
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 6px; }
          50% { height: 32px; }
        }
      `}</style>
    </div>
  );
}

function DarkStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20',
    amber: 'text-amber-300 bg-amber-500/10 border-amber-400/20',
    fuchsia: 'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-400/20',
    indigo: 'text-indigo-300 bg-indigo-500/10 border-indigo-400/20',
  };
  return (
    <div className={cn('rounded-xl border p-3', colorMap[color])}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide opacity-80 mb-1">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="text-lg font-bold text-white tabular-nums">{value}</div>
    </div>
  );
}
