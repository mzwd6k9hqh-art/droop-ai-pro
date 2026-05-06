import React from 'react';
import { DraggableGrid } from '@/components/DraggableGrid';
import { getStoreStats, fmtMoney } from '@/lib/storeStats';
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingBag, Users,
  CreditCard, Calendar, Wallet, Receipt, Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Earnings() {
  const s = getStoreStats();

  const earningsCards: Record<string, { title: string; render: () => React.ReactNode }> = {
    total: {
      title: 'Total earnings',
      render: () => <Card icon={DollarSign} accent="emerald" label="Total earnings (30d)" value={fmtMoney(s.revenue30d)} />,
    },
    net: {
      title: 'Net profit',
      render: () => <Card icon={Wallet} accent="primary" label="Net profit" value={fmtMoney(s.netProfit30d)} />,
    },
    orders: {
      title: 'Orders',
      render: () => <Card icon={ShoppingBag} accent="accent" label="Orders" value={String(s.orders)} />,
    },
    aov: {
      title: 'Average order value',
      render: () => <Card icon={Receipt} accent="amber" label="Avg order value" value={fmtMoney(s.avgOrderValue)} />,
    },
    customers: {
      title: 'Paying customers',
      render: () => <Card icon={Users} accent="info" label="Paying customers" value={String(s.customers)} />,
    },
    pending: {
      title: 'Pending payouts',
      render: () => <Card icon={CreditCard} accent="warning" label="Pending payouts" value={fmtMoney(0)} />,
    },
    topProduct: {
      title: 'Top product',
      render: () => (
        <div className="elevated-card p-5 h-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Top product</span>
          </div>
          {s.topProduct ? (
            <>
              <p className="font-semibold">{s.topProduct.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{fmtMoney(s.topProduct.revenue)} • {s.topProduct.units} units sold</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No sales yet.</p>
          )}
        </div>
      ),
    },
  };

  const ids = Object.keys(earningsCards);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <DollarSign className="h-7 w-7 text-emerald-600" /> Earnings
        </h1>
        <p className="text-muted-foreground mt-1">
          Real numbers from your store — nothing fabricated.
        </p>
      </div>

      <div className="elevated-card p-5 bg-gradient-to-br from-emerald-500/5 to-primary/5 border-emerald-500/20">
        <div className="flex items-start gap-3">
          <div className="icon-feature icon-success">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold mb-1">This month at a glance</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {s.orders === 0
                ? "No earnings yet. As soon as your first order comes in, real revenue, payouts, and customer numbers will show up here."
                : <>You earned <strong className="text-foreground">{fmtMoney(s.revenue30d)}</strong> across <strong className="text-foreground">{s.orders} orders</strong> from <strong className="text-foreground">{s.customers} paying customers</strong>.</>}
            </p>
          </div>
        </div>
      </div>

      <DraggableGrid
        ids={ids}
        storageKey="droop_earnings_order_v2"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {(id) => earningsCards[id]?.render() ?? null}
      </DraggableGrid>

      <div className="elevated-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Recent transactions
          </h2>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">
          No transactions yet.
        </p>
      </div>
    </div>
  );
}

function Card({
  icon: Icon, label, value, delta, deltaUp, accent,
}: {
  icon: any; label: string; value: string; delta?: string; deltaUp?: boolean;
  accent: 'emerald' | 'primary' | 'accent' | 'amber' | 'info' | 'warning';
}) {
  const accentMap = {
    emerald: 'bg-emerald-500/10 text-emerald-600',
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    amber: 'bg-amber-500/10 text-amber-600',
    info: 'bg-sky-500/10 text-sky-600',
    warning: 'bg-orange-500/10 text-orange-600',
  } as const;
  return (
    <div className="elevated-card p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className={cn('p-2 rounded-lg', accentMap[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      {delta && (
        <div className={cn(
          'flex items-center gap-1 text-xs mt-1',
          deltaUp ? 'text-emerald-600' : 'text-muted-foreground',
        )}>
          {deltaUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {delta}
        </div>
      )}
    </div>
  );
}
