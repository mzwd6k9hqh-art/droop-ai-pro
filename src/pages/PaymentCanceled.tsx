import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PaymentCanceled() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="elevated-card max-w-md w-full p-8 text-center space-y-5">
        <div className="h-14 w-14 mx-auto rounded-full bg-muted flex items-center justify-center">
          <XCircle className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">{t('pay.canceledTitle')}</h1>
        <p className="text-sm text-muted-foreground">{params.get('kind') === 'publish' ? 'Payment was not completed. Your store has not been published.' : t('pay.canceledBody')}</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate(params.get('kind') === 'publish' ? '/ai' : '/upgrade')}>
            {t('pay.tryAgain')}
          </Button>
          <Button className="flex-1 gradient-button" onClick={() => navigate('/ai')}>
            {t('pay.backToChat')}
          </Button>
        </div>
      </div>
    </div>
  );
}
