import React, { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Send, Plus, MessageSquare, Search, Pencil, Users, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Chat {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_avatar: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
}
interface Message {
  id: string;
  chat_id: string;
  sender: 'seller' | 'customer';
  content: string;
  created_at: string;
}

export default function CustomerChat() {
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Bootstrap an anonymous Supabase session so RLS works
  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSellerId(session.user.id);
        setAuthReady(true);
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          toast.error('Could not connect: ' + error.message);
          setAuthReady(true);
          return;
        }
        if (data.user) setSellerId(data.user.id);
        setAuthReady(true);
      }
      const sub = supabase.auth.onAuthStateChange((_e, s) => {
        setSellerId(s?.user?.id ?? null);
      });
      unsub = sub.data.subscription;
    })();

    return () => { unsub?.unsubscribe(); };
  }, []);

  // Load chats
  useEffect(() => {
    if (!sellerId) return;
    (async () => {
      const { data, error } = await supabase
        .from('customer_chats')
        .select('*')
        .order('last_message_at', { ascending: false });
      if (error) { console.error(error); return; }
      setChats((data ?? []) as Chat[]);
      if (data && data.length && !activeId) setActiveId(data[0].id);
    })();

    // Realtime
    const ch = supabase
      .channel('cchats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_chats' }, async () => {
        const { data } = await supabase
          .from('customer_chats').select('*').order('last_message_at', { ascending: false });
        setChats((data ?? []) as Chat[]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sellerId]); // eslint-disable-line

  // Load messages of active
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    (async () => {
      const { data, error } = await supabase
        .from('customer_messages').select('*')
        .eq('chat_id', activeId).order('created_at');
      if (!error) setMessages((data ?? []) as Message[]);
    })();
    const ch = supabase
      .channel(`msg-${activeId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'customer_messages', filter: `chat_id=eq.${activeId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const filtered = useMemo(
    () => chats.filter(c =>
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.customer_email ?? '').toLowerCase().includes(search.toLowerCase())
    ),
    [chats, search],
  );

  const activeChat = chats.find(c => c.id === activeId) || null;

  const createChat = async () => {
    if (!newName.trim() || !sellerId) return;
    const { data, error } = await supabase.from('customer_chats').insert({
      seller_id: sellerId,
      customer_name: newName.trim(),
      customer_email: newEmail.trim() || null,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setShowNew(false); setNewName(''); setNewEmail('');
    setActiveId((data as Chat).id);
    toast.success('Conversation created');
  };

  const sendMessage = async (sender: 'seller' | 'customer' = 'seller') => {
    if (!input.trim() || !activeId || !sellerId) return;
    const content = input.trim();
    setInput('');
    const { error } = await supabase.from('customer_messages').insert({
      chat_id: activeId, seller_id: sellerId, sender, content, read: sender === 'seller',
    });
    if (error) { toast.error(error.message); return; }
    await supabase.from('customer_chats').update({
      last_message: content,
      last_message_at: new Date().toISOString(),
    }).eq('id', activeId);
  };

  if (!authReady) {
    return <div className="p-12 text-center text-muted-foreground">Loading messages...</div>;
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" /> Customer Chat
          </h1>
          <p className="text-muted-foreground mt-1">Talk directly with your subscribers and customers.</p>
        </div>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New chat</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Start a conversation</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Customer name</label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email (optional)</label>
                <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@example.com" type="email" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button onClick={createChat} disabled={!newName.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* List */}
        <div className="elevated-card p-3 flex flex-col">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers" className="pl-8" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {filtered.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8 px-3">
                <MessageSquare className="h-10 w-10 mx-auto opacity-40 mb-2" />
                No conversations yet. Click "New chat" to start.
              </div>
            ) : filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-colors',
                  activeId === c.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-semibold shrink-0">
                    {c.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{c.customer_name}</p>
                      {c.unread_count > 0 && (
                        <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">{c.unread_count}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.last_message || 'No messages yet'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className="elevated-card flex flex-col overflow-hidden">
          {activeChat ? (
            <>
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold">{activeChat.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{activeChat.customer_email || 'No email on file'}</p>
                </div>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => sendMessage('customer')}
                  disabled={!input.trim()}
                  title="Simulate a customer reply with the current text"
                >
                  Simulate customer reply
                </Button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/20">
                {messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-12">
                    <MessageSquare className="h-10 w-10 mx-auto opacity-40 mb-2" />
                    Send your first message to {activeChat.customer_name}.
                  </div>
                ) : messages.map(m => (
                  <div key={m.id} className={cn('flex', m.sender === 'seller' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2 text-sm',
                      m.sender === 'seller'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-card border border-border rounded-bl-sm',
                    )}>
                      {m.content}
                      <div className={cn('text-[10px] mt-1', m.sender === 'seller' ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-border bg-card">
                <div className="relative flex items-end gap-2">
                  <Pencil className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage('seller');
                      }
                    }}
                    placeholder="Type a message..."
                    className="min-h-[44px] max-h-32 resize-none pl-9"
                    rows={1}
                  />
                  <Button onClick={() => sendMessage('seller')} disabled={!input.trim()} size="icon" className="h-11 w-11 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="font-medium">No conversation selected</p>
                <p className="text-sm text-muted-foreground mt-1">Pick a customer on the left or start a new chat.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <AlertCircle className="h-3 w-3" />
        Messages are stored privately to your account. Use "Simulate customer reply" to preview both sides of the conversation.
      </p>
    </div>
  );
}
