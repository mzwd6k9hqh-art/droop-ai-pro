import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  CreditCard, ShoppingBag, MessageCircle, Mail, FileText,
  Sheet, Zap, Webhook, Plug, Check
} from 'lucide-react';

type Provider = {
  id: string;
  name: string;
  description: string;
  icon: typeof Plug;
  fields: Array<{ key: string; label: string; type?: string; placeholder?: string }>;
};

const PROVIDERS: Provider[] = [
  { id: 'stripe', name: 'Stripe', description: 'Accept payments and manage subscriptions.', icon: CreditCard,
    fields: [{ key: 'api_key', label: 'Secret API Key', type: 'password', placeholder: 'sk_live_…' }] },
  { id: 'shopify', name: 'Shopify', description: 'Sync products, orders, and inventory.', icon: ShoppingBag,
    fields: [
      { key: 'shop', label: 'Shop domain', placeholder: 'mystore.myshopify.com' },
      { key: 'access_token', label: 'Admin API Access Token', type: 'password' },
    ] },
  { id: 'discord', name: 'Discord', description: 'Send notifications via webhook.', icon: MessageCircle,
    fields: [{ key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://discord.com/api/webhooks/…' }] },
  { id: 'gmail', name: 'Gmail', description: 'Send transactional email from your account.', icon: Mail,
    fields: [{ key: 'app_password', label: 'App Password', type: 'password' }, { key: 'email', label: 'Email address' }] },
  { id: 'notion', name: 'Notion', description: 'Sync customer data and notes.', icon: FileText,
    fields: [{ key: 'integration_token', label: 'Integration Token', type: 'password' }, { key: 'database_id', label: 'Database ID' }] },
  { id: 'google_sheets', name: 'Google Sheets', description: 'Mirror orders and analytics.', icon: Sheet,
    fields: [{ key: 'sheet_id', label: 'Sheet ID' }, { key: 'service_account', label: 'Service Account JSON', type: 'password' }] },
  { id: 'zapier', name: 'Zapier', description: 'Trigger thousands of apps via webhook.', icon: Zap,
    fields: [{ key: 'webhook_url', label: 'Catch Hook URL' }] },
  { id: 'webhook', name: 'Custom Webhook', description: 'Send events to any HTTPS endpoint.', icon: Webhook,
    fields: [{ key: 'url', label: 'Endpoint URL' }, { key: 'secret', label: 'Signing Secret (optional)', type: 'password' }] },
];

export default function Integrations() {
  const { user, isAuthenticated } = useAuth();
  const [rows, setRows] = useState<Record<string, { status: string; config: any }>>({});
  const [open, setOpen] = useState<Provider | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!isAuthenticated || !user || user.isGuest) return;
    const { data } = await supabase.from('integrations').select('provider,status,config').eq('user_id', user.id);
    const map: Record<string, any> = {};
    (data || []).forEach((r: any) => { map[r.provider] = { status: r.status, config: r.config }; });
    setRows(map);
  };
  useEffect(() => { load(); }, [user?.id]);

  const openConfigure = (p: Provider) => {
    setValues(rows[p.id]?.config || {});
    setOpen(p);
  };

  const save = async () => {
    if (!open || !user || user.isGuest) {
      toast.error('Sign in to save integrations');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('integrations').upsert({
      user_id: user.id,
      provider: open.id,
      status: 'connected',
      config: values,
      credentials: values, // stored server-side, scoped by RLS to this user
    }, { onConflict: 'user_id,provider' });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${open.name} connected`);
    setOpen(null);
    load();
  };

  const disconnect = async (id: string) => {
    if (!user) return;
    await supabase.from('integrations').delete().eq('user_id', user.id).eq('provider', id);
    toast.success('Disconnected');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect Zyra to the tools you already use. Credentials are stored encrypted and scoped to your account.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROVIDERS.map(p => {
          const connected = rows[p.id]?.status === 'connected';
          const Icon = p.icon;
          return (
            <Card key={p.id} className="p-5 space-y-3 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-accent/40 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                {connected && <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" /> Connected</Badge>}
              </div>
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={connected ? 'outline' : 'default'} onClick={() => openConfigure(p)}>
                  {connected ? 'Configure' : 'Connect'}
                </Button>
                {connected && (
                  <Button size="sm" variant="ghost" onClick={() => disconnect(p.id)}>Disconnect</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!open} onOpenChange={v => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {open?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {open?.fields.map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  type={f.type || 'text'}
                  placeholder={f.placeholder}
                  value={values[f.key] || ''}
                  onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <Button onClick={save} disabled={loading} className="w-full">
              {loading ? 'Saving…' : 'Save & Connect'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
