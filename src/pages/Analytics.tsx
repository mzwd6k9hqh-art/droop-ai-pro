import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { analyticsInsights } from '@/data/mockData';
import { DraggableGrid } from '@/components/DraggableGrid';
import {
  TrendingUp,
  Lightbulb,
  Target,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const impactColors = {
  High: 'bg-success/10 text-success border-success/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  Low: 'bg-muted text-muted-foreground border-border',
};

const statCards: Record<string, () => React.ReactNode> = {
  revenue: () => (
    <div className="stat-card h-full">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Revenue Growth</span>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-bold">+12%</span>
        <span className="text-sm text-success flex items-center pb-1">
          <ArrowUpRight className="h-3 w-3" /> MoM
        </span>
      </div>
    </div>
  ),
  retention: () => (
    <div className="stat-card h-full">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Customer Retention</span>
        <PieChart className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-bold">87%</span>
        <span className="text-sm text-success flex items-center pb-1">
          <ArrowUpRight className="h-3 w-3" /> +5%
        </span>
      </div>
    </div>
  ),
  conversion: () => (
    <div className="stat-card h-full">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Conversion Rate</span>
        <Target className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-bold">4.2%</span>
        <span className="text-sm text-success flex items-center pb-1">
          <ArrowUpRight className="h-3 w-3" /> +0.8%
        </span>
      </div>
    </div>
  ),
  market: () => (
    <div className="stat-card h-full">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Market Score</span>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-bold">92</span>
        <span className="text-sm text-muted-foreground pb-1">/100</span>
      </div>
    </div>
  ),
};

export default function Analytics() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('analytics.title')}</h1>
        <p className="text-muted-foreground mt-1">
          AI-generated insights and recommendations for your business
        </p>
      </div>

      {/* Plain-text summary */}
      <div className="elevated-card p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="icon-feature icon-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold mb-1">Analytics summary</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your store is trending well: revenue is up <strong className="text-foreground">12% MoM</strong> while customer retention sits at a strong <strong className="text-foreground">87%</strong> (+5 pts). Conversion improved by <strong className="text-foreground">0.8 pts to 4.2%</strong>, and your overall market-fit score is <strong className="text-foreground">92/100</strong>. The biggest lever to pull next is the <em>{analyticsInsights.salesPerformance[0]?.title}</em> insight below — it's flagged High Impact. Drag any card to rearrange your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview — drag to reorder */}
      <DraggableGrid
        ids={['revenue', 'retention', 'conversion', 'market']}
        storageKey="droop_analytics_stats_order_v1"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {(id) => statCards[id]?.() ?? null}
      </DraggableGrid>

      {/* Sales Performance */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-feature icon-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold">{t('analytics.performance')}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {analyticsInsights.salesPerformance.map((item, index) => (
            <div key={index} className="elevated-card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{item.title}</h3>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full border',
                  impactColors[item.impact as keyof typeof impactColors]
                )}>
                  {item.impact} Impact
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{item.insight}</p>
              <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
                <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{item.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Market Opportunities */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-feature icon-warning">
            <Lightbulb className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold">{t('analytics.opportunities')}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {analyticsInsights.marketOpportunities.map((item, index) => (
            <div key={index} className="elevated-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {item.opportunity}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{item.insight}</p>
              <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
                <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{item.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conversion Suggestions */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-feature icon-success">
            <Target className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold">{t('analytics.conversions')}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {analyticsInsights.conversionSuggestions.map((item, index) => (
            <div key={index} className="elevated-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                  {item.expectedLift}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{item.insight}</p>
              <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
                <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
