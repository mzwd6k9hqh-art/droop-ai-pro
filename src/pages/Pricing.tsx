import React from 'react';
import { useAuth, PlanType } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Check,
  Crown,
  Zap,
  Star,
  Sparkles,
  Bot,
  BarChart3,
  Globe,
  Lock,
  Infinity,
  Users,
  HeadphonesIcon,
  Shield,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const WHOP_CHECKOUT_URL = 'https://whop.com/checkout/your-product-id';

interface PlanFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ElementType;
  features: PlanFeature[];
  highlight?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic features',
    icon: Zap,
    features: [
      { name: '5 AI messages per day', included: true },
      { name: 'Basic store preview', included: true },
      { name: 'Dashboard overview', included: true },
      { name: 'Single conversation', included: true },
      { name: 'Image upload', included: false },
      { name: 'Store analysis', included: false },
      { name: 'Priority support', included: false },
      { name: 'API access', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    period: '/month',
    description: 'For individual entrepreneurs',
    icon: Star,
    features: [
      { name: '25 AI messages per day', included: true, highlight: true },
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
    description: 'For growing businesses',
    icon: Crown,
    highlight: true,
    badge: 'Most Popular',
    features: [
      { name: '100 AI messages per day', included: true, highlight: true },
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
    description: 'For established businesses',
    icon: Sparkles,
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

export default function Pricing() {
  const { user, updatePlan } = useAuth();
  const { t } = useLanguage();

  const handleUpgrade = (planId: PlanType) => {
    if (planId === 'free') {
      updatePlan('free');
      toast.success('Downgraded to Free plan');
      return;
    }

    // Redirect to Whop checkout
    window.open(`${WHOP_CHECKOUT_URL}?plan=${planId}`, '_blank');
    
    // For demo purposes, we'll also update locally
    // In production, this would be handled by webhook after payment
    toast.info('Redirecting to checkout...');
    setTimeout(() => {
      updatePlan(planId);
      toast.success(`Upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`);
    }, 1000);
  };

  return (
    <div className="py-4 animate-slide-up">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Crown className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Choose Your Plan</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {t('pricing.title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Scale your business with AI-powered insights. Start free and upgrade as you grow.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = user?.plan === plan.id;
          
          return (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-2xl p-6 transition-all',
                plan.highlight
                  ? 'gradient-button ring-2 ring-primary shadow-xl scale-105'
                  : 'elevated-card'
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-warning text-warning-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div
                  className={cn(
                    'inline-flex rounded-2xl mb-4',
                    plan.highlight
                      ? 'p-3 bg-white/20'
                      : 'icon-action icon-primary'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-7 w-7',
                      plan.highlight ? 'text-white' : ''
                    )}
                  />
                </div>
                <h3 className={cn(
                  'text-xl font-semibold',
                  plan.highlight && 'text-white'
                )}>{plan.name}</h3>
                <p
                  className={cn(
                    'text-sm mt-1',
                    plan.highlight
                      ? 'text-white/80'
                      : 'text-muted-foreground'
                  )}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={cn(
                  'text-4xl font-bold',
                  plan.highlight && 'text-white'
                )}>{plan.price}</span>
                <span
                  className={cn(
                    'text-sm',
                    plan.highlight
                      ? 'text-white/80'
                      : 'text-muted-foreground'
                  )}
                >
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className={cn(
                    'flex items-start gap-2 text-sm',
                    plan.highlight && 'text-white'
                  )}>
                    {feature.included ? (
                      <Check
                        className={cn(
                          'h-4 w-4 mt-0.5 flex-shrink-0',
                          feature.highlight
                            ? plan.highlight
                              ? 'text-warning'
                              : 'text-secondary'
                            : ''
                        )}
                      />
                    ) : (
                      <Lock
                        className={cn(
                          'h-4 w-4 mt-0.5 flex-shrink-0 opacity-40',
                          plan.highlight
                            ? 'text-white/50'
                            : 'text-muted-foreground'
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        !feature.included && 'opacity-50',
                        feature.highlight && 'font-medium'
                      )}
                    >
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
                  'w-full',
                  isCurrent && 'opacity-50 cursor-not-allowed',
                  !plan.highlight && 'gradient-button'
                )}
              >
                {isCurrent ? t('pricing.current') : t('pricing.upgrade')}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">All Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Bot, label: 'Zyra Assistant', color: 'icon-primary' },
            { icon: BarChart3, label: 'Business Analytics', color: 'icon-info' },
            { icon: Globe, label: 'Global Market Data', color: 'icon-secondary' },
            { icon: Rocket, label: 'Growth Insights', color: 'icon-warning' },
            { icon: Users, label: 'Team Collaboration', color: 'icon-accent' },
            { icon: Shield, label: 'Secure & Private', color: 'icon-success' },
            { icon: HeadphonesIcon, label: 'Expert Support', color: 'icon-info' },
            { icon: Infinity, label: 'Unlimited Potential', color: 'icon-primary' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl elevated-card"
            >
              <div className={cn('icon-feature', item.color)}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
