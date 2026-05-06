import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { globalMarkets, bestCountries, trendingNiches } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { DraggableGrid } from '@/components/DraggableGrid';
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
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const quickActions: Record<string, () => React.ReactNode> = {
  ai: () => (
    <Link to="/ai" className="block group h-full">
      <div className="elevated-card p-6 h-full border-transparent hover:border-primary/30 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="icon-action icon-solid-primary">
            <Bot className="h-7 w-7" />
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Zyra Assistant</h3>
        <p className="text-sm text-muted-foreground">Get AI-powered business insights</p>
      </div>
    </Link>
  ),
  analytics: () => (
    <Link to="/analytics" className="block group h-full">
      <div className="elevated-card p-6 h-full border-transparent hover:border-secondary/30 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="icon-action icon-solid-secondary">
            <LineChart className="h-7 w-7" />
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Smart Analytics</h3>
        <p className="text-sm text-muted-foreground">View detailed metrics and insights</p>
      </div>
    </Link>
  ),
  upgrade: () => (
    <Link to="/pricing" className="block group h-full">
      <div className="elevated-card p-6 h-full border-transparent hover:border-accent/30 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="icon-action icon-solid-accent">
            <Rocket className="h-7 w-7" />
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Upgrade Plan</h3>
        <p className="text-sm text-muted-foreground">Unlock more features and unlimited AI</p>
      </div>
    </Link>
  ),
};

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
                  Ask Zyra
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

      {/* Store Context Banner / Publish Prompt */}
      {(() => {
        const isPublished = typeof window !== 'undefined' && localStorage.getItem('droop_store_published') === 'true';
        if (isPublished && user?.storeUrl) {
          return (
            <div className="elevated-card p-4 bg-gradient-to-r from-emerald-500/10 to-primary/10 border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="icon-feature icon-success"><Store className="h-5 w-5" /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{t('dashboard.realData')}</p>
                  <a href={user.storeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                    {user.storeUrl}<ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="elevated-card p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <div className="flex items-start gap-3">
              <div className="icon-feature icon-warning"><Rocket className="h-5 w-5" /></div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{t('dashboard.publishPrompt')}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t('dashboard.publishPromptBody')}</p>
                <Link to="/ai">
                  <Button size="sm" className="gradient-button gap-2"><Rocket className="h-4 w-4" />{t('dashboard.publishNow')}</Button>
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Text summary */}
      <div className="elevated-card p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="icon-feature icon-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold mb-1">Your business in one paragraph</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No live performance data yet — once your store is published and customers start ordering, real revenue, conversion and store score will appear here.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions — drag to reorder */}
      <DraggableGrid
        ids={['ai', 'analytics', 'upgrade']}
        storageKey="droop_dashboard_quickactions_order_v1"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {(id) => quickActions[id]?.() ?? null}
      </DraggableGrid>

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
