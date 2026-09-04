import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, PlanType } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Check,
  Crown,
  Zap,
  Star,
  Sparkles,
  Lock,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const WHOP_CHECKOUT_URL = 'https://whop.com/checkout/your-product-id';

interface PlanCard {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  dailyMessages: number | 'unlimited';
  description: string;
  icon: React.ElementType;
  features: { name: string; included: boolean; highlight?: boolean }[];
  highlight?: boolean;
  badge?: string;
  gradient: string;
}

const plans: PlanCard[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'free forever',
    dailyMessages: 5,
    description: 'Get started with the basics',
    icon: Zap,
    gradient: 'from-slate-500 to-slate-600',
    features: [
      { name: '5 daily AI messages', included: true },
      { name: 'Basic store preview', included: true },
      { name: 'Dashboard', included: true },
      { name: 'Single conversation', included: true },
      { name: 'Image & video upload', included: false },
      { name: 'Store analysis', included: false },
      { name: 'Advanced reports', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    period: '/month',
    dailyMessages: 25,
    description: 'For solo entrepreneurs',
    icon: Star,
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      { name: '25 daily AI messages', included: true, highlight: true },
      { name: 'Unlimited conversations', included: true },
      { name: 'Image & video upload', included: true },
      { name: 'Store analysis', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Multi-page store', included: true },
      { name: 'Export reports', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: '/month',
    dailyMessages: 100,
    description: 'For growing businesses',
    icon: Crown,
    highlight: true,
    badge: 'Most Popular',
    gradient: 'from-primary to-accent',
    features: [
      { name: '100 daily AI messages', included: true, highlight: true },
      { name: 'Advanced AI analysis', included: true, highlight: true },
      { name: 'Full analytics suite', included: true },
      { name: 'Competitor tracking', included: true },
      { name: 'Custom reports & export', included: true },
      { name: 'Email support', included: true },
      { name: 'Store customization tools', included: true },
      { name: 'API access', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$99',
    period: '/month',
    dailyMessages: 'unlimited',
    description: 'For established businesses',
    icon: Sparkles,
    gradient: 'from-amber-500 to-orange-500',
    features: [
      { name: 'Unlimited AI messages', included: true, highlight: true },
      { name: 'All Pro features', included: true },
      { name: 'White-label reports', included: true },
      { name: 'Team collaboration (5 seats)', included: true },
      { name: 'Full API access', included: true },
      { name: 'Priority 24/7 support', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Dedicated account manager', included: true },
    ],
  },
];

export default function Upgrade() {
  const navigate = useNavigate();
  const { user, updatePlan, getAiMessagesRemaining, getDailyLimit, isUnlimitedPlan } = useAuth();

  const [loadingPlan, setLoadingPlan] = React.useState<PlanType | null>(null);

  const handleUpgrade = async (planId: PlanType) => {
    if (planId === 'free') {
      updatePlan('free');
      toast.success(t('plan.switchedFree'));
      return;
    }
    try {
      setLoadingPlan(planId);
      await startCheckout({ kind: 'plan', plan: planId as 'starter' | 'pro' | 'premium' });
    } catch (e) {
      setLoadingPlan(null);
      toast.error((e as Error).message);
    }
  };

  return (
    // Force English on this page regardless of app language setting
    <div className="min-h-screen bg-background" dir="ltr" lang="en">
      <div className="sticky top-0 z-10 flex items-center h-14 px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-lg mr-3"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Upgrade your plan</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        {user && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Current plan:{' '}
                    <span className="text-primary">
                      {plans.find(p => p.id === user.plan)?.name || user.plan}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isUnlimitedPlan()
                      ? 'Unlimited messages ✨'
                      : `${getAiMessagesRemaining()} of ${getDailyLimit()} daily messages remaining`}
                  </p>
                </div>
              </div>
              {!isUnlimitedPlan() && (
                <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${Math.max(5, (getAiMessagesRemaining() / getDailyLimit()) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = user?.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-2xl p-5 transition-all',
                  plan.highlight
                    ? 'bg-gradient-to-br from-primary to-accent text-white ring-2 ring-primary shadow-xl sm:scale-105'
                    : 'elevated-card'
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-warning text-warning-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className={cn(
                    'inline-flex p-2.5 rounded-xl mb-3',
                    plan.highlight ? 'bg-white/20' : 'bg-gradient-to-br ' + plan.gradient
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className={cn('text-lg font-bold', plan.highlight && 'text-white')}>{plan.name}</h3>
                  <p className={cn('text-xs mt-0.5', plan.highlight ? 'text-white/70' : 'text-muted-foreground')}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-4">
                  <span className={cn('text-3xl font-bold', plan.highlight && 'text-white')}>{plan.price}</span>
                  <span className={cn('text-sm', plan.highlight ? 'text-white/70' : 'text-muted-foreground')}>
                    {plan.period}
                  </span>
                </div>

                <div className={cn(
                  'mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
                  plan.highlight ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary border border-primary/20'
                )}>
                  <MessageSquare className="h-3.5 w-3.5" />
                  {plan.dailyMessages === 'unlimited' ? 'Unlimited messages' : `${plan.dailyMessages} messages/day`}
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={cn('flex items-start gap-2 text-xs', plan.highlight && 'text-white')}>
                      {feature.included ? (
                        <Check className={cn('h-3.5 w-3.5 mt-0.5 flex-shrink-0', feature.highlight ? (plan.highlight ? 'text-warning' : 'text-secondary') : '')} />
                      ) : (
                        <Lock className={cn('h-3.5 w-3.5 mt-0.5 flex-shrink-0 opacity-40', plan.highlight ? 'text-white/50' : 'text-muted-foreground')} />
                      )}
                      <span className={cn(!feature.included && 'opacity-50', feature.highlight && 'font-semibold')}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent}
                  variant={plan.highlight ? 'secondary' : 'default'}
                  className={cn(
                    'w-full rounded-xl',
                    isCurrent && 'opacity-50 cursor-not-allowed',
                    !plan.highlight && !isCurrent && 'gradient-button'
                  )}
                >
                  {isCurrent ? 'Current plan' : 'Choose this plan'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
