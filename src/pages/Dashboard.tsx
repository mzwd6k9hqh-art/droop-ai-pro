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
  Rocket,
  LineChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Hero Section */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Welcome back</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
                {t('dashboard.welcome')}, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                {t('dashboard.insights')} Let's grow your business together.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/ai">
                <Button size="lg" className="gap-2 gradient-button shadow-lg hover:shadow-xl transition-shadow">
                  <Bot className="h-5 w-5" />
                  Ask DROOP AI
                </Button>
              </Link>
              <Link to="/analytics">
                <Button size="lg" variant="outline" className="gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Store Context Banner */}
      {user?.storeUrl && (
        <div className="elevated-card p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-feature icon-primary">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/ai" className="group">
          <div className="elevated-card p-6 h-full border-transparent hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="icon-action icon-solid-primary">
                <Bot className="h-7 w-7" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-lg mb-2">DROOP AI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Get AI-powered business insights for {user?.storeUrl ? 'your store' : 'your business'}
            </p>
          </div>
        </Link>

        <Link to="/analytics" className="group">
          <div className="elevated-card p-6 h-full border-transparent hover:border-secondary/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="icon-action icon-solid-secondary">
                <LineChart className="h-7 w-7" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Smart Analytics</h3>
            <p className="text-sm text-muted-foreground">
              View detailed performance metrics and actionable insights
            </p>
          </div>
        </Link>

        <Link to="/pricing" className="group">
          <div className="elevated-card p-6 h-full border-transparent hover:border-accent/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="icon-action icon-solid-accent">
                <Rocket className="h-7 w-7" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Upgrade Plan</h3>
            <p className="text-sm text-muted-foreground">
              Unlock more features and unlimited AI capabilities
            </p>
          </div>
        </Link>
      </div>

      {/* Global Markets */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-feature icon-primary">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t('dashboard.markets')}</h2>
            <p className="text-sm text-muted-foreground">Global e-commerce market insights</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {globalMarkets.map((market) => (
            <div key={market.id} className="elevated-card p-5">
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
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-feature icon-secondary">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t('dashboard.countries')}</h2>
            <p className="text-sm text-muted-foreground">Top performing markets for e-commerce</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {bestCountries.map((country, index) => (
            <div key={country.id} className="elevated-card p-4 relative overflow-hidden">
              {index === 0 && (
                <div className="absolute top-3 right-3">
                  <div className="p-1.5 rounded-full bg-warning/10">
                    <Crown className="h-4 w-4 text-warning" />
                  </div>
                </div>
              )}
              <div className="text-3xl mb-3">{country.flag}</div>
              <h3 className="font-semibold text-sm mb-2">{country.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all"
                    style={{ width: `${country.score}%` }}
                  />
                </div>
                <span className="text-xs font-semibold">{country.score}</span>
              </div>
              <div className="space-y-1">
                {country.highlights.slice(0, 2).map((highlight, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-secondary flex-shrink-0" />
                    <span className="truncate">{highlight}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Niches */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-feature icon-accent">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t('dashboard.trending')}</h2>
            <p className="text-sm text-muted-foreground">Hot market opportunities right now</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingNiches.slice(0, 3).map((niche) => (
            <div key={niche.id} className="elevated-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="icon-feature icon-accent">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{niche.interest}% interest</span>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{niche.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{niche.description}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className={cn(
                  'px-2.5 py-1 rounded-full font-medium',
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
