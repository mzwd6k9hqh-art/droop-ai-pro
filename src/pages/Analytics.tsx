import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DraggableGrid } from '@/components/DraggableGrid';
import { getStoreStats, fmtMoney, fmtHour } from '@/lib/storeStats';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Target,
  FileText,
  Rocket,
  Globe,
  Clock,
  Package,
  Users,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Analytics() {
  const { t } = useLanguage();
  const stats = getStoreStats();
  const isPublished = stats.isPublished;

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
    visits: () => (
      <div className="stat-card h-full">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Visits (30d)</span>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-bold">{stats.views30d}</span>
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

  const maxPeak = stats.peakHours[0]?.visits || 1;

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
        ids={['revenue', 'orders', 'visits', 'conversion', 'market']}
        storageKey="droop_analytics_stats_order_v3"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {(id) => statCards[id]?.() ?? null}
      </DraggableGrid>

      {/* Honest score breakdown */}
      <section className="elevated-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-feature icon-primary"><Activity className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-semibold">Why your score is {stats.rating}/100</h2>
            <p className="text-sm text-muted-foreground">An honest breakdown — points are only earned for real results.</p>
          </div>
        </div>
        {stats.ratingReasons.length === 0 ? (
          <p className="text-sm text-muted-foreground">Your store is scoring full marks on every tracked factor.</p>
        ) : (
          <ul className="space-y-2">
            {stats.ratingReasons.map((r, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-amber-500">•</span>{r}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic sources */}
        <section className="elevated-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-feature icon-secondary"><Globe className="h-5 w-5" /></div>
            <h2 className="text-lg font-semibold">Traffic sources</h2>
          </div>
          {stats.trafficSources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visits recorded yet, so there are no traffic sources to show.</p>
          ) : (
            <div className="space-y-3">
              {stats.trafficSources.map((s) => (
                <div key={s.source}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium">{s.source}</span>
                    <span className="text-muted-foreground">{s.visits} visits · {s.share.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${s.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Peak hours */}
        <section className="elevated-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-feature icon-accent"><Clock className="h-5 w-5" /></div>
            <h2 className="text-lg font-semibold">Peak hours</h2>
          </div>
          {stats.peakHours.length === 0 ? (
            <p className="text-sm text-muted-foreground">No traffic recorded yet, so peak shopping hours are unknown.</p>
          ) : (
            <div className="space-y-3">
              {stats.peakHours.map((h) => (
                <div key={h.hour} className="flex items-center gap-3">
                  <span className="text-xs w-14 text-muted-foreground">{fmtHour(h.hour)}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent to-secondary rounded-full" style={{ width: `${(h.visits / maxPeak) * 100}%` }} />
                  </div>
                  <span className="text-xs w-10 text-right tabular-nums">{h.visits}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Best products */}
        <section className="elevated-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-feature icon-success"><Package className="h-5 w-5" /></div>
            <h2 className="text-lg font-semibold">Best products</h2>
          </div>
          {stats.bestProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products have sold yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.bestProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate">{i + 1}. {p.name}</span>
                  <span className="text-muted-foreground whitespace-nowrap">{fmtMoney(p.revenue)} · {p.units} sold</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Customer behavior */}
        <section className="elevated-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-feature icon-info"><Users className="h-5 w-5" /></div>
            <h2 className="text-lg font-semibold">Customer behavior</h2>
          </div>
          {!stats.hasData ? (
            <p className="text-sm text-muted-foreground">No customer activity recorded yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Metric label="Add-to-cart rate" value={`${stats.behavior.addToCartRate.toFixed(1)}%`} />
              <Metric label="Checkout rate" value={`${stats.behavior.checkoutRate.toFixed(1)}%`} />
              <Metric label="Cart abandonment" value={`${stats.behavior.cartAbandonment.toFixed(1)}%`} />
              <Metric label="Repeat customers" value={`${stats.behavior.repeatCustomerRate.toFixed(1)}%`} />
              <Metric label="Visits per order" value={stats.behavior.avgSessionsBeforeOrder.toFixed(1)} />
              <Metric label="Avg order value" value={fmtMoney(stats.avgOrderValue)} />
            </div>
          )}
        </section>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-feature icon-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold">{t('analytics.performance')}</h2>
        </div>
        <div className="elevated-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {stats.hasData
              ? 'Trends will get sharper as more days of real activity are recorded.'
              : 'No performance data yet. Insights will appear here once your store starts receiving real traffic and orders.'}
          </p>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
