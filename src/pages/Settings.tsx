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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Account Section */}
      <section className="elevated-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-primary">
            <User className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">{t('settings.account')}</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground">
                Your subscription and features
              </p>
            </div>
            <span
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1.5',
                planBadgeStyles[user?.plan || 'free']
              )}
            >
              <Crown className="h-3.5 w-3.5" />
              {planLabels[user?.plan || 'free']}
            </span>
          </div>
        </div>
      </section>

      {/* Store Information Section */}
      <section className="elevated-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-secondary">
            <Store className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">Store Information</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeUrl" className="flex items-center gap-2">
              Store URL
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </Label>
            <Input
              id="storeUrl"
              type="text"
              value={user?.storeUrl || ''}
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Your store URL is used for personalized analytics and AI insights. Contact support to change it.
            </p>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="elevated-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-accent">
            <Palette className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">{t('settings.theme')}</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {theme === 'light' ? (
                <Sun className="h-5 w-5 text-warning" />
              ) : (
                <Moon className="h-5 w-5 text-info" />
              )}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>
      </section>

      {/* Language Section */}
      <section className="elevated-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-info">
            <Globe className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">{t('settings.language')}</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Display Language</p>
              <p className="text-sm text-muted-foreground">
                Choose your preferred language
              </p>
            </div>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as 'en' | 'ar' | 'fr')}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="elevated-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-warning">
            <Bell className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive updates about insights and reports
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Marketing Updates</p>
              <p className="text-sm text-muted-foreground">
                News about new features and tips
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="elevated-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-success">
            <Shield className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">
                Update your account password
              </p>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
