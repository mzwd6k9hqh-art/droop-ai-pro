import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { analyticsInsights } from '@/data/mockData';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const impactColors = {
  High: 'bg-success/10 text-success border-success/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  Low: 'bg-muted text-muted-foreground border-border',
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
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

        <div className="stat-card">
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

        <div className="stat-card">
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

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Market Score</span>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold">92</span>
            <span className="text-sm text-muted-foreground pb-1">/100</span>
          </div>
        </div>
      </div>

      {/* Sales Performance */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
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
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
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
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
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
