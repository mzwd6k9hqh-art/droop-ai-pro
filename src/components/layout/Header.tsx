import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, PlanType } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Zap,
  BarChart3,
  Bot,
  CreditCard,
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
  Menu,
  LayoutDashboard,
  Sparkles,
  PhoneCall,
  MessageSquare,
  DollarSign,
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

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full gradient-header shadow-lg">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-105">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-white/80" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-tight">Zyra</span>
              <span className="text-[10px] text-white/60 leading-none">Sales Booster</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:text-white hover:bg-white/10">
                <LayoutDashboard className="h-4 w-4" />
                {t('nav.dashboard')}
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:text-white hover:bg-white/10">
                <BarChart3 className="h-4 w-4" />
                {t('nav.analytics')}
              </Button>
            </Link>
            <Link to="/ai">
              <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:text-white hover:bg-white/10">
                <Bot className="h-4 w-4" />
                {t('nav.droopai')}
              </Button>
            </Link>
            <Link to="/voice-call">
              <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:text-white hover:bg-white/10">
                <PhoneCall className="h-4 w-4" />
                Voice
              </Button>
            </Link>
            <Link to="/customers">
              <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:text-white hover:bg-white/10">
                <MessageSquare className="h-4 w-4" />
                Customers
              </Button>
            </Link>
            <Link to="/earnings">
              <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:text-white hover:bg-white/10">
                <DollarSign className="h-4 w-4" />
                Earnings
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:text-white hover:bg-white/10">
                <CreditCard className="h-4 w-4" />
                {t('nav.pricing')}
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span
              className={cn(
                'hidden sm:inline-flex px-2.5 py-1 text-xs font-medium rounded-full',
                planBadgeStyles[user.plan]
              )}
            >
              {planLabels[user.plan]}
            </span>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-white/90 hover:text-white hover:bg-white/10"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-white/90 hover:text-white hover:bg-white/10">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user && (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                {t('nav.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t('nav.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-white/90 hover:text-white hover:bg-white/10">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t('nav.dashboard')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/analytics')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                {t('nav.analytics')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/ai')}>
                <Bot className="mr-2 h-4 w-4" />
                {t('nav.droopai')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/voice-call')}>
                <PhoneCall className="mr-2 h-4 w-4" />
                Voice Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/customers')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Customers
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/earnings')}>
                <DollarSign className="mr-2 h-4 w-4" />
                Earnings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/pricing')}>
                <CreditCard className="mr-2 h-4 w-4" />
                {t('nav.pricing')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
