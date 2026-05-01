import React from 'react';
import { DraggableGrid } from '@/components/DraggableGrid';
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingBag, Users,
  CreditCard, Calendar, ArrowUpRight, Wallet, Receipt, Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const earningsCards: Record<string, { title: string; render: () => React.ReactNode }> = {
  total: {
    title: 'Total earnings',
    render: () => (
      <Card icon={DollarSign} accent="emerald" label="Total earnings (30d)" value="$12,486" delta="+18.2%" deltaUp />
    ),
  },
  net: {
    title: 'Net profit',
    render: () => (
      <Card icon={Wallet} accent="primary" label="Net profit" value="$7,318" delta="+9.4%" deltaUp />
    ),
  },
  orders: {
    title: 'Orders',
    render: () => (
      <Card icon={ShoppingBag} accent="accent" label="Orders" value="324" delta="+12 today" deltaUp />
    ),
  },
  aov: {
    title: 'Average order value',
    render: () => (
      <Card icon={Receipt} accent="amber" label="Avg order value" value="$38.54" delta="-2.1%" />
    ),
  },
  customers: {
    title: 'Paying customers',
    render: () => (
      <Card icon={Users} accent="info" label="Paying customers" value="241" delta="+27 new" deltaUp />
    ),
  },
  pending: {
    title: 'Pending payouts',
    render: () => (
      <Card icon={CreditCard} accent="warning" label="Pending payouts" value="$1,840" delta="Settles Friday" />
    ),
  },
  goal: {
    title: 'Monthly goal',
    render: () => (
      <div className="elevated-card p-5 h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Monthly goal</span>
          <Target className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold mb-2">$12,486 / $20,000</div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-primary" style={{ width: '62%' }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">62% of your $20k target — 12 days left.</p>
      </div>
    ),
  },
  topProduct: {
    title: 'Top product',
    render: () => (
      <div className="elevated-card p-5 h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Top product</span>
          <ArrowUpRight className="h-4 w-4 text-emerald-600" />
        </div>
        <p className="font-semibold">Premium Gift Box</p>
        <p className="text-sm text-muted-foreground mt-1">$3,210 in revenue • 84 units sold</p>
      </div>
    ),
  },
};

export default function Earnings() {
  const ids = Object.keys(earningsCards);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <DollarSign className="h-7 w-7 text-emerald-600" /> Earnings
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your profits and rearrange any card by dragging the handle that appears on hover.
        </p>
      </div>

      {/* Text summary */}
      <div className="elevated-card p-5 bg-gradient-to-br from-emerald-500/5 to-primary/5 border-emerald-500/20">
        <div className="flex items-start gap-3">
          <div className="icon-feature icon-success">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold mb-1">This month at a glance</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You earned <strong className="text-foreground">$12,486</strong> across <strong className="text-foreground">324 orders</strong> from <strong className="text-foreground">241 paying customers</strong> — that's an 18% jump versus last month and your best month so far. Net profit landed at <strong className="text-foreground">$7,318</strong>, leaving a healthy ~58% margin. Your "Premium Gift Box" alone drove <strong className="text-foreground">26%</strong> of all revenue. Push it harder this week and you'll likely beat your $20k goal.
            </p>
          </div>
        </div>
      </div>

      <DraggableGrid
        ids={ids}
        storageKey="droop_earnings_order_v1"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {(id) => earningsCards[id]?.render() ?? null}
      </DraggableGrid>

      {/* Recent transactions */}
      <div className="elevated-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Recent transactions
          </h2>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Sarah M.', product: 'Premium Gift Box', amount: 49, when: '2h ago' },
            { name: 'Liam K.', product: 'Skincare Set', amount: 84, when: '5h ago' },
            { name: 'Aisha R.', product: 'Coffee Subscription', amount: 22, when: '1d ago' },
            { name: 'Marcus T.', product: 'Premium Gift Box', amount: 49, when: '1d ago' },
            { name: 'Yuki S.', product: 'Tote Bag', amount: 18, when: '2d ago' },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-sm font-semibold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.product} · {t.when}</p>
                </div>
              </div>
              <span className="font-semibold text-emerald-600">+${t.amount}</span>
            </div>
          ))}
        </div>
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
