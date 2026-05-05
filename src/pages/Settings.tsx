import React from 'react';
import { useAuth, PlanType } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Globe,
  Moon,
  Sun,
  Crown,
  Shield,
  Bell,
  Palette,
  Store,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
      </div>

      <section className="elevated-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-primary"><User className="h-5 w-5" /></div>
          <h2 className="text-lg font-semibold">{t('settings.account')}</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium">{t('settings.name')}</p>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium">{t('settings.email')}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{t('settings.currentPlan')}</p>
            </div>
            <span className={cn('px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1.5', planBadgeStyles[user?.plan || 'free'])}>
              <Crown className="h-3.5 w-3.5" />
              {planLabels[user?.plan || 'free']}
            </span>
          </div>
        </div>
      </section>

      <section className="elevated-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-secondary"><Store className="h-5 w-5" /></div>
          <h2 className="text-lg font-semibold">{t('settings.storeInfo')}</h2>
        </div>
        <div className="space-y-2">
          <Label htmlFor="storeUrl" className="flex items-center gap-2">
            {t('settings.storeUrl')}
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </Label>
          <Input id="storeUrl" type="text" value={user?.storeUrl || ''} disabled className="bg-muted/50 cursor-not-allowed" />
        </div>
      </section>

      <section className="elevated-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-accent"><Palette className="h-5 w-5" /></div>
          <h2 className="text-lg font-semibold">{t('settings.theme')}</h2>
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            {theme === 'light' ? <Sun className="h-5 w-5 text-warning" /> : <Moon className="h-5 w-5 text-info" />}
            <div>
              <p className="font-medium">{t('settings.darkMode')}</p>
              <p className="text-sm text-muted-foreground">{t('settings.darkModeDesc')}</p>
            </div>
          </div>
          <Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} />
        </div>
      </section>

      <section className="elevated-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-info"><Globe className="h-5 w-5" /></div>
          <h2 className="text-lg font-semibold">{t('settings.language')}</h2>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">{t('settings.displayLanguage')}</p>
            <p className="text-sm text-muted-foreground">{t('settings.displayLanguageDesc')}</p>
          </div>
          <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'ar' | 'fr')}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇺🇸 English</SelectItem>
              <SelectItem value="ar">🇸🇦 العربية</SelectItem>
              <SelectItem value="fr">🇫🇷 Français</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  );
}
