import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const duration = prefersReducedMotion ? 500 : 2500;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          navigate('/');
        }
      }, 300); // Wait for fade-out
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
        {/* Logo Container with Glow */}
        <div className="splash-logo">
          <div className="splash-logo-inner">
            <Zap className="h-12 w-12 text-white" />
          </div>
          <div className="splash-glow" />
        </div>
        
        {/* Brand Name */}
        <div className="splash-text">
          <h1 className="text-3xl font-bold tracking-tight">Sales Booster</h1>
          <p className="text-muted-foreground mt-2">Powered by DROOP AI</p>
        </div>
      </div>
    </div>
  );
}
