import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DraggableGrid } from '@/components/DraggableGrid';
import { getStoreStats, fmtMoney } from '@/lib/storeStats';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Target,
  FileText,
  Rocket,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Analytics() {
  const { t } = useLanguage();
  const stats = getStoreStats();
  const isPublished = typeof window !== 'undefined' && localStorage.getItem('droop_store_published') === 'true';

  const statCards: Record<string, () => React.ReactNode> = {
    revenue: () => (
      <div className="stat-card h-full">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Revenue (30d)</span>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-bold">{fmtMoney(stats.revenue30d)}</span>
        </div>
      </div>
    ),
    orders: () => (
      <div className="stat-card h-full">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Orders</span>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-bold">{stats.orders}</span>
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
          <span className="text-3xl font-bold">{stats.conversion.toFixed(1)}%</span>
        </div>
      </div>
    ),
    market: () => (
      <div className="stat-card h-full">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Store Score</span>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-bold">{stats.rating}</span>
          <span className="text-sm text-muted-foreground pb-1">/100</span>
        </div>
      </div>
    ),
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('analytics.title')}</h1>
        <p className="text-muted-foreground mt-1">
          Real numbers from your store — nothing fabricated.
        </p>
      </div>

      {!isPublished && (
        <div className="elevated-card p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <div className="flex items-start gap-3">
            <div className="icon-feature icon-warning"><Rocket className="h-5 w-5" /></div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Publish your store to see real analytics</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Once your store is live, ZYRA will track real visitors, orders, and revenue here.
              </p>
              <Link to="/ai">
                <Button size="sm" className="gradient-button gap-2"><Rocket className="h-4 w-4" />Publish Now</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="elevated-card p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="icon-feature icon-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold mb-1">Analytics summary</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stats.orders === 0
                ? "No sales activity recorded yet. Once customers start ordering, you'll see real revenue, orders, conversion, and a store score reflecting actual performance."
                : <>You earned <strong className="text-foreground">{fmtMoney(stats.revenue30d)}</strong> across <strong className="text-foreground">{stats.orders} orders</strong> in the last 30 days. Conversion sits at <strong className="text-foreground">{stats.conversion.toFixed(1)}%</strong> with a store score of <strong className="text-foreground">{stats.rating}/100</strong>.</>}
            </p>
          </div>
        </div>
      </div>

      <DraggableGrid
        ids={['revenue', 'orders', 'conversion', 'market']}
        storageKey="droop_analytics_stats_order_v2"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {(id) => statCards[id]?.() ?? null}
      </DraggableGrid>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-feature icon-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold">{t('analytics.performance')}</h2>
        </div>
        <div className="elevated-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No performance data yet. Insights will appear here once your store starts receiving real traffic and orders.
          </p>
        </div>
      </section>
    </div>
  );
}
