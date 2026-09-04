import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { verifyPayment } from '@/lib/payments';
import { useAuth, PlanType } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { updatePlan } = useAuth();
  const { t } = useLanguage();
  const [state, setState] = useState<'loading' | 'paid' | 'failed'>('loading');
  const [detail, setDetail] = useState<string>('');

  useEffect(() => {
    const sessionId = params.get('session_id');
    if (!sessionId) {
      setState('failed');
      return;
    }
    let active = true;
    verifyPayment(sessionId)
      .then((res) => {
        if (!active) return;
        if (!res.paid) {
          setState('failed');
          return;
        }
        if (res.kind === 'plan' && res.plan) {
          updatePlan(res.plan as PlanType);
          setDetail(res.plan);
        }
        if (res.kind === 'domain' && res.domain) {
          const url = `https://${res.domain}`;
          localStorage.setItem('droop_store_published', 'true');
          localStorage.setItem('droop_store_published_url', url);
          setDetail(res.domain);
        }
        setState('paid');
      })
      .catch(() => active && setState('failed'));
    return () => {
      active = false;
    };
  }, [params, updatePlan]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="elevated-card max-w-md w-full p-8 text-center space-y-5">
        {state === 'loading' && (
          <>
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
            <h1 className="text-xl font-bold">{t('pay.verifying')}</h1>
          </>
        )}

        {state === 'paid' && (
          <>
            <div className="h-14 w-14 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold">{t('pay.successTitle')}</h1>
            <p className="text-sm text-muted-foreground">
              {detail ? `${t('pay.successBody')} — ${detail}` : t('pay.successBody')}
            </p>
            <div className="flex gap-2">
              <Button className="flex-1 gradient-button gap-2" onClick={() => navigate('/ai')}>
                {t('pay.backToChat')} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
                {t('nav.dashboard')}
              </Button>
            </div>
          </>
        )}

        {state === 'failed' && (
          <>
            <div className="h-14 w-14 mx-auto rounded-full bg-amber-500/15 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold">{t('pay.failedTitle')}</h1>
            <p className="text-sm text-muted-foreground">{t('pay.failedBody')}</p>
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={() => navigate('/upgrade')}>
                {t('pay.tryAgain')}
              </Button>
              <Button className="flex-1 gradient-button" onClick={() => navigate('/ai')}>
                {t('pay.backToChat')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
