import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 500 : 2500;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          navigate('/dashboard');
        }
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [navigate, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-6 splash-content">
        <div className="splash-logo relative">
          <div className="splash-logo-inner">
            <Bot className="h-12 w-12 text-white" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent" />
          <div className="splash-glow" />
        </div>
        
        <div className="splash-text">
          <h1 className="text-3xl font-bold tracking-tight">ZYRA</h1>
          <p className="text-muted-foreground mt-2">Sales Booster Platform</p>
        </div>
      </div>
    </div>
  );
}
