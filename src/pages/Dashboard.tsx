import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { globalMarkets, bestCountries, trendingNiches } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Globe,
  MapPin,
  Sparkles,
  Bot,
  BarChart3,
  ArrowRight,
  ArrowUpRight,
  Crown,
  Zap,
  Target,
  Lightbulb,
  Store,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('dashboard.welcome')}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('dashboard.insights')}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/ai">
            <Button className="gap-2 gradient-button">
              <Bot className="h-4 w-4" />
              Ask DROOP AI
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Store Context Banner */}
      {user?.storeUrl && (
        <div className="elevated-card p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-container icon-primary">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Analyzing data for your store</p>
                <a 
                  href={user.storeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {user.storeUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/ai" className="action-card group">
          <div className="flex items-start justify-between">
            <div className="icon-container icon-primary">
              <Bot className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-semibold mt-4">DROOP AI Assistant</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Get AI-powered business insights for {user?.storeUrl ? 'your store' : 'your business'}
          </p>
        </Link>

        <Link to="/analytics" className="action-card group">
          <div className="flex items-start justify-between">
            <div className="icon-container icon-info">
              <BarChart3 className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-semibold mt-4">Business Analytics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            View detailed performance metrics and insights
          </p>
        </Link>

        <Link to="/pricing" className="action-card group">
          <div className="flex items-start justify-between">
            <div className="icon-container icon-warning">
              <Crown className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-semibold mt-4">Upgrade Plan</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Unlock more features and AI capabilities
          </p>
        </Link>
      </div>

      {/* Global Markets */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t('dashboard.markets')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {globalMarkets.map((market) => (
            <div key={market.id} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {market.name}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-success">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {market.growth}
                </span>
              </div>
              <div className="text-2xl font-bold mb-2">{market.size}</div>
              <p className="text-xs text-muted-foreground">{market.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Best Countries */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-secondary" />
          <h2 className="text-xl font-semibold">{t('dashboard.countries')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {bestCountries.map((country, index) => (
            <div key={country.id} className="stat-card relative overflow-hidden">
              {index === 0 && (
                <div className="absolute top-2 right-2">
                  <Crown className="h-4 w-4 text-warning" />
                </div>
              )}
              <div className="text-3xl mb-2">{country.flag}</div>
              <h3 className="font-semibold text-sm">{country.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full"
                    style={{ width: `${country.score}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{country.score}</span>
              </div>
              <div className="mt-3 space-y-1">
                {country.highlights.slice(0, 2).map((highlight, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3 text-secondary" />
                    {highlight}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Niches */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">{t('dashboard.trending')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingNiches.slice(0, 3).map((niche) => (
            <div key={niche.id} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="icon-container icon-accent">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{niche.interest}%</span>
                </div>
              </div>
              <h3 className="font-semibold">{niche.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{niche.description}</p>
              <div className="flex items-center gap-3 mt-4 text-xs">
                <span className={cn(
                  'px-2 py-0.5 rounded-full',
                  niche.competition === 'Low' && 'bg-success/10 text-success',
                  niche.competition === 'Medium' && 'bg-warning/10 text-warning',
                  niche.competition === 'High' && 'bg-destructive/10 text-destructive'
                )}>
                  {niche.competition} Competition
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {niche.potential} Potential
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
