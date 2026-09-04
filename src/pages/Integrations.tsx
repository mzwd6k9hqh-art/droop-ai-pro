import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Check, Plug, Zap, Trash2, CheckCircle2, Circle } from 'lucide-react';
import {
  INTEGRATIONS,
  IntegrationDef,
  connectIntegration,
  disconnectIntegration,
  loadIntegrations,
  loadReminders,
  saveReminders,
  triggerIntegration,
} from '@/lib/integrations';

export default function Integrations() {
  const [connected, setConnected] = useState(() => loadIntegrations());
  const [active, setActive] = useState<IntegrationDef | null>(null);
  const [endpoint, setEndpoint] = useState('');
  const [reminders, setReminders] = useState(() => loadReminders());

  const isConnected = (id: string) => connected.some((c) => c.id === id);

  const openDialog = (def: IntegrationDef) => {
    setActive(def);
    setEndpoint(connected.find((c) => c.id === def.id)?.endpoint || '');
  };

  const handleConnect = () => {
    if (!active) return;
    if (!/^https?:\/\//i.test(endpoint.trim())) {
      toast.error('Please paste a valid link starting with https://');
      return;
    }
    connectIntegration(active.id, endpoint.trim());
    setConnected(loadIntegrations());
    setActive(null);
    toast.success(`${active.name} connected`);
  };

  const handleDisconnect = (id: string, name: string) => {
    disconnectIntegration(id);
    setConnected(loadIntegrations());
    toast.success(`${name} disconnected`);
  };

  const handleTest = async (id: string, name: string) => {
    const ok = await triggerIntegration(id, { type: 'test', message: 'Hello from ZYRA 👋' });
    ok ? toast.success(`Test sent to ${name}`) : toast.error('Could not reach that link');
  };

  const toggleReminder = (id: string) => {
    const next = reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r));
    setReminders(next);
    saveReminders(next);
  };

  const removeReminder = (id: string) => {
    const next = reminders.filter((r) => r.id !== id);
    setReminders(next);
    saveReminders(next);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slide-up pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connected apps & devices</h1>
        <p className="text-muted-foreground mt-1">
          Give ZYRA the ability to act outside this app — your calendar, reminders, smart home and any
          service with a webhook.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((def) => (
          <div key={def.id} className="elevated-card p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{def.emoji}</span>
                <div>
                  <p className="font-semibold">{def.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{def.category.replace('-', ' ')}</p>
                </div>
              </div>
              {isConnected(def.id) && (
                <Badge className="bg-success/15 text-success border-0">
                  <Check className="h-3 w-3 mr-1" /> Connected
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{def.description}</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {def.abilities.map((a) => (
                <li key={a} className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-primary" /> {a}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-auto pt-2">
              <Button size="sm" variant={isConnected(def.id) ? 'outline' : 'default'} onClick={() => openDialog(def)}>
                <Plug className="h-4 w-4 mr-1.5" />
                {isConnected(def.id) ? 'Edit' : 'Connect'}
              </Button>
              {isConnected(def.id) && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => handleTest(def.id, def.name)}>
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDisconnect(def.id, def.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="elevated-card p-6">
        <h2 className="text-lg font-semibold mb-1">Your reminders</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Anything you ask ZYRA to remind you about shows up here.
        </p>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reminders yet — try telling ZYRA “remind me to restock tomorrow at 9am”.
          </p>
        ) : (
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <button onClick={() => toggleReminder(r.id)} aria-label="Toggle reminder">
                  {r.done ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={r.done ? 'line-through text-muted-foreground' : 'font-medium'}>{r.text}</p>
                  {r.dueAt && <p className="text-xs text-muted-foreground">{r.dueAt}</p>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeReminder(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {active?.emoji} Connect {active?.name}
            </DialogTitle>
            <DialogDescription>
              Paste the link your service gives you. ZYRA will send requests there when you ask her to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="endpoint">{active?.fieldLabel}</Label>
            <Input
              id="endpoint"
              value={endpoint}
              placeholder={active?.fieldPlaceholder}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button onClick={handleConnect}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
