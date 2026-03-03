import React from 'react';
import { useNavigate } from 'react-router-dom';
import StoreOnboarding, { OnboardingResult } from '@/components/StoreOnboarding';

const ONBOARDING_KEY = 'droop_onboarding_complete';

export default function Onboarding() {
  const navigate = useNavigate();

  const handleComplete = (result: OnboardingResult) => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    localStorage.setItem('droop_store_context', JSON.stringify(result));
    navigate('/ai');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <StoreOnboarding onComplete={handleComplete} />
    </div>
  );
}
