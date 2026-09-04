import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, PlanType } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
  User,
  Globe,
  Moon,
  Sun,
  Crown,
  Bell,
  Palette,
  Store,
  Lock,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Plug,
  Trash2,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DEFAULT_PREFERENCES,
  Preferences,
  clearChatHistory,
  loadPreferences,
  savePreferences,
} from '@/lib/preferences';
import { loadIntegrations } from '@/lib/integrations';

const planBadgeStyles: Record<PlanType, string> = {
  free: 'bg-muted text-muted-foreground',
  starter: 'badge-starter',
  pro: 'badge-pro',
  premium: 'badge-premium',
};

const planLabels: Record<PlanType, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  premium: 'Premium',
};

function Section({
  icon,
  tone,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="elevated-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={cn('icon-container', tone)}>{icon}</div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<Preferences>(() => loadPreferences());
  const connectedCount = loadIntegrations().length;

  useEffect(() => {
    savePreferences(prefs);
  }, [prefs]);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const exportData = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            preferences: prefs,
            integrations: loadIntegrations(),
            localData: Object.fromEntries(
              Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])
            ),
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zyra-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Your data has been downloaded');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Account */}
      <Section icon={<User className="h-5 w-5" />} tone="icon-primary" title={t('settings.account')}>
        <div className="space-y-1">
          <Row title={t('settings.name')} description={user?.name} >
            <span />
          </Row>
          <Row title={t('settings.email')} description={user?.email}>
            <span />
          </Row>
          <Row title={t('settings.currentPlan')}>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1.5',
                  planBadgeStyles[user?.plan || 'free']
                )}
              >
                <Crown className="h-3.5 w-3.5" />
                {planLabels[user?.plan || 'free']}
              </span>
              <Button size="sm" variant="outline" onClick={() => navigate('/upgrade')}>
                Upgrade
              </Button>
            </div>
          </Row>
        </div>
      </Section>

      {/* AI behavior */}
      <Section
        icon={<Sparkles className="h-5 w-5" />}
        tone="icon-accent"
        title="ZYRA behavior"
        description="Customize how ZYRA talks and what she focuses on"
      >
        <div className="space-y-1">
          <Row title="Tone" description="The personality of her replies">
            <Select value={prefs.aiTone} onValueChange={(v) => update('aiTone', v as Preferences['aiTone'])}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="concise">Straight to the point</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row title="Answer length" description="How much detail she gives">
            <Select value={prefs.aiLength} onValueChange={(v) => update('aiLength', v as Preferences['aiLength'])}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row title="Main focus" description="What she should be best at">
            <Select
              value={prefs.aiExpertise}
              onValueChange={(v) => update('aiExpertise', v as Preferences['aiExpertise'])}
            >
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Everyday assistant</SelectItem>
                <SelectItem value="ecommerce">Store & selling</SelectItem>
                <SelectItem value="coding">Coding help</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
                <SelectItem value="research">Research</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row title="Use emojis" description="Tasteful emojis in answers">
            <Switch checked={prefs.aiEmojis} onCheckedChange={(c) => update('aiEmojis', c)} />
          </Row>
          <Row title="Proactive suggestions" description="She suggests a smart next step">
            <Switch checked={prefs.aiProactive} onCheckedChange={(c) => update('aiProactive', c)} />
          </Row>
          <div className="pt-4 space-y-2">
            <Label htmlFor="nickname">What should ZYRA call you?</Label>
            <Input
              id="nickname"
              value={prefs.aiNickname}
              placeholder="Your name or nickname"
              onChange={(e) => update('aiNickname', e.target.value)}
            />
          </div>
          <div className="pt-4 space-y-2">
            <Label htmlFor="instructions">Custom instructions</Label>
            <Textarea
              id="instructions"
              rows={4}
              value={prefs.aiCustomInstructions}
              placeholder="e.g. I sell handmade jewelry in Morocco. Always answer with practical steps and give prices in MAD."
              onChange={(e) => update('aiCustomInstructions', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              ZYRA keeps this in mind in every conversation.
            </p>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section
        icon={<Bell className="h-5 w-5" />}
        tone="icon-warning"
        title="Notifications"
        description="Choose what you want to hear about"
      >
        <div className="space-y-1">
          <Row title="Product & feature updates">
            <Switch
              checked={prefs.notifyProductUpdates}
              onCheckedChange={(c) => update('notifyProductUpdates', c)}
            />
          </Row>
          <Row title="Reminders and tasks" description="Alerts for reminders ZYRA sets for you">
            <Switch checked={prefs.notifyReminders} onCheckedChange={(c) => update('notifyReminders', c)} />
          </Row>
          <Row title="Sound" description="Play a sound on new replies">
            <Switch checked={prefs.notifySound} onCheckedChange={(c) => update('notifySound', c)} />
          </Row>
          <Row title="Email summaries">
            <Switch checked={prefs.notifyEmail} onCheckedChange={(c) => update('notifyEmail', c)} />
          </Row>
        </div>
      </Section>

      {/* Chat history */}
      <Section
        icon={<MessageSquare className="h-5 w-5" />}
        tone="icon-info"
        title="Chat history"
        description="Control what gets kept"
      >
        <div className="space-y-1">
          <Row title="Save conversations" description="Keep your chats on this device">
            <Switch checked={prefs.saveHistory} onCheckedChange={(c) => update('saveHistory', c)} />
          </Row>
          <div className="py-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium">Conversations kept</p>
              <span className="text-sm text-muted-foreground">{prefs.historyLimit}</span>
            </div>
            <Slider
              value={[prefs.historyLimit]}
              min={5}
              max={200}
              step={5}
              onValueChange={([v]) => update('historyLimit', v)}
            />
          </div>
          <Row title="Delete all chats" description="This cannot be undone">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                clearChatHistory();
                toast.success('All conversations deleted');
              }}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </Row>
        </div>
      </Section>

      {/* Connections */}
      <Section
        icon={<Plug className="h-5 w-5" />}
        tone="icon-secondary"
        title="Connected apps & devices"
        description="Calendar, reminders, smart home and more"
      >
        <Row
          title={connectedCount > 0 ? `${connectedCount} connected` : 'Nothing connected yet'}
          description="Let ZYRA act outside this app"
        >
          <Button size="sm" onClick={() => navigate('/integrations')}>
            Manage
          </Button>
        </Row>
      </Section>

      {/* Appearance */}
      <Section icon={<Palette className="h-5 w-5" />} tone="icon-accent" title={t('settings.theme')}>
        <Row title={t('settings.darkMode')} description={t('settings.darkModeDesc')}>
          <div className="flex items-center gap-3">
            {theme === 'light' ? (
              <Sun className="h-5 w-5 text-warning" />
            ) : (
              <Moon className="h-5 w-5 text-info" />
            )}
            <Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} />
          </div>
        </Row>
      </Section>

      {/* Language */}
      <Section icon={<Globe className="h-5 w-5" />} tone="icon-info" title={t('settings.language')}>
        <Row title={t('settings.displayLanguage')} description={t('settings.displayLanguageDesc')}>
          <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'ar' | 'fr')}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇺🇸 English</SelectItem>
              <SelectItem value="ar">🇸🇦 العربية</SelectItem>
              <SelectItem value="fr">🇫🇷 Français</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Section>

      {/* Store */}
      <Section icon={<Store className="h-5 w-5" />} tone="icon-secondary" title={t('settings.storeInfo')}>
        <div className="space-y-2">
          <Label htmlFor="storeUrl" className="flex items-center gap-2">
            {t('settings.storeUrl')}
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </Label>
          <Input
            id="storeUrl"
            type="text"
            value={user?.storeUrl || ''}
            disabled
            className="bg-muted/50 cursor-not-allowed"
          />
        </div>
      </Section>

      {/* Privacy */}
      <Section
        icon={<ShieldCheck className="h-5 w-5" />}
        tone="icon-success"
        title="Privacy & data"
        description="You stay in control"
      >
        <div className="space-y-1">
          <Row title="Usage analytics" description="Helps improve the app">
            <Switch checked={prefs.allowAnalytics} onCheckedChange={(c) => update('allowAnalytics', c)} />
          </Row>
          <Row title="Personalized answers" description="ZYRA uses your store and preferences as context">
            <Switch
              checked={prefs.allowPersonalization}
              onCheckedChange={(c) => update('allowPersonalization', c)}
            />
          </Row>
          <Row title="Web search" description="Allow ZYRA to look things up online">
            <Switch checked={prefs.allowWebSearch} onCheckedChange={(c) => update('allowWebSearch', c)} />
          </Row>
          <Row title="Download my data" description="Everything stored on this device">
            <Button size="sm" variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-1.5" />
              Export
            </Button>
          </Row>
          <Row title="Reset all settings" description="Back to the defaults">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPrefs({ ...DEFAULT_PREFERENCES });
                toast.success('Settings reset');
              }}
            >
              Reset
            </Button>
          </Row>
        </div>
      </Section>
    </div>
  );
}
