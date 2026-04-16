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
  nameAr: string;
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
    nameAr: 'مجاني',
    price: '$0',
    period: 'مجاناً للأبد',
    dailyMessages: 5,
    description: 'ابدأ مجاناً مع الميزات الأساسية',
    icon: Zap,
    gradient: 'from-slate-500 to-slate-600',
    features: [
      { name: '5 رسائل يومية للذكاء الاصطناعي', included: true },
      { name: 'معاينة المتجر الأساسية', included: true },
      { name: 'لوحة التحكم', included: true },
      { name: 'محادثة واحدة', included: true },
      { name: 'رفع الصور والفيديو', included: false },
      { name: 'تحليل المتجر', included: false },
      { name: 'تقارير متقدمة', included: false },
      { name: 'دعم الأولوية', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    nameAr: 'مبتدئ',
    price: '$19',
    period: '/شهرياً',
    dailyMessages: 25,
    description: 'لرواد الأعمال الأفراد',
    icon: Star,
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      { name: '25 رسالة يومية للذكاء الاصطناعي', included: true, highlight: true },
      { name: 'محادثات غير محدودة', included: true },
      { name: 'رفع الصور والفيديو', included: true },
      { name: 'تحليل المتجر', included: true },
      { name: 'تحليلات أساسية', included: true },
      { name: 'متجر متعدد الصفحات', included: true },
      { name: 'تصدير التقارير', included: false },
      { name: 'دعم الأولوية', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    nameAr: 'احترافي',
    price: '$49',
    period: '/شهرياً',
    dailyMessages: 100,
    description: 'للأعمال المتنامية',
    icon: Crown,
    highlight: true,
    badge: 'الأكثر شعبية',
    gradient: 'from-primary to-accent',
    features: [
      { name: '100 رسالة يومية للذكاء الاصطناعي', included: true, highlight: true },
      { name: 'تحليل ذكاء اصطناعي متقدم', included: true, highlight: true },
      { name: 'مجموعة تحليلات كاملة', included: true },
      { name: 'تتبع المنافسين', included: true },
      { name: 'تقارير مخصصة وتصدير', included: true },
      { name: 'دعم عبر البريد الإلكتروني', included: true },
      { name: 'أدوات تخصيص المتجر', included: true },
      { name: 'وصول API', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    nameAr: 'مميز',
    price: '$99',
    period: '/شهرياً',
    dailyMessages: 'unlimited',
    description: 'للأعمال الراسخة',
    icon: Sparkles,
    gradient: 'from-amber-500 to-orange-500',
    features: [
      { name: 'رسائل ذكاء اصطناعي غير محدودة', included: true, highlight: true },
      { name: 'جميع ميزات Pro', included: true },
      { name: 'تقارير بشعارك', included: true },
      { name: 'تعاون الفريق (5 مقاعد)', included: true },
      { name: 'وصول كامل لـ API', included: true },
      { name: 'دعم أولوية 24/7', included: true },
      { name: 'تكاملات مخصصة', included: true },
      { name: 'مدير حساب مخصص', included: true },
    ],
  },
];

export default function Upgrade() {
  const navigate = useNavigate();
  const { user, updatePlan, getAiMessagesRemaining, getDailyLimit, isUnlimitedPlan } = useAuth();

  const handleUpgrade = (planId: PlanType) => {
    if (planId === 'free') {
      updatePlan('free');
      toast.success('تم التخفيض إلى الخطة المجانية');
      return;
    }
    window.open(`${WHOP_CHECKOUT_URL}?plan=${planId}`, '_blank');
    toast.info('جاري التوجيه إلى صفحة الدفع...');
    setTimeout(() => {
      updatePlan(planId);
      toast.success(`تمت الترقية إلى خطة ${plans.find(p => p.id === planId)?.nameAr}!`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center h-14 px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/ai')}
          className="h-9 w-9 rounded-lg mr-3"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">ترقية خطتك</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Current Plan Info */}
        {user && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">خطتك الحالية: <span className="text-primary">{plans.find(p => p.id === user.plan)?.nameAr || user.plan}</span></p>
                  <p className="text-xs text-muted-foreground">
                    {isUnlimitedPlan()
                      ? 'رسائل غير محدودة ✨'
                      : `${getAiMessagesRemaining()} رسائل متبقية من ${getDailyLimit()} يومياً`}
                  </p>
                </div>
              </div>
              {!isUnlimitedPlan() && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                      style={{ width: `${Math.max(5, (getAiMessagesRemaining() / getDailyLimit()) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plans Grid */}
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

                {/* Plan Header */}
                <div className="mb-4">
                  <div className={cn(
                    'inline-flex p-2.5 rounded-xl mb-3',
                    plan.highlight ? 'bg-white/20' : 'bg-gradient-to-br ' + plan.gradient + ' bg-opacity-10'
                  )}>
                    <Icon className={cn('h-6 w-6', plan.highlight ? 'text-white' : 'text-white')} />
                  </div>
                  <h3 className={cn('text-lg font-bold', plan.highlight && 'text-white')}>{plan.name}</h3>
                  <p className={cn('text-xs mt-0.5', plan.highlight ? 'text-white/70' : 'text-muted-foreground')}>
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className={cn('text-3xl font-bold', plan.highlight && 'text-white')}>{plan.price}</span>
                  <span className={cn('text-sm', plan.highlight ? 'text-white/70' : 'text-muted-foreground')}>
                    {plan.period}
                  </span>
                </div>

                {/* Daily Messages Badge */}
                <div className={cn(
                  'mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
                  plan.highlight
                    ? 'bg-white/20 text-white'
                    : 'bg-primary/10 text-primary border border-primary/20'
                )}>
                  <MessageSquare className="h-3.5 w-3.5" />
                  {plan.dailyMessages === 'unlimited' ? 'رسائل غير محدودة' : `${plan.dailyMessages} رسالة/يوم`}
                </div>

                {/* Features */}
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

                {/* CTA */}
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
                  {isCurrent ? 'خطتك الحالية' : 'اختر هذه الخطة'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
