import React from 'react';
import { Bot, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DroopAILogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  variant?: 'default' | 'gradient' | 'minimal';
  className?: string;
}

const sizeClasses = {
  sm: { container: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-base' },
  md: { container: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-lg' },
  lg: { container: 'h-14 w-14', icon: 'h-7 w-7', text: 'text-xl' },
  xl: { container: 'h-20 w-20', icon: 'h-10 w-10', text: 'text-2xl' },
};

export function DroopAILogo({
  size = 'md',
  showText = false,
  animated = false,
  variant = 'gradient',
  className,
}: DroopAILogoProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative">
        {/* Glow effect for larger sizes */}
        {(size === 'lg' || size === 'xl') && variant === 'gradient' && (
          <div 
            className={cn(
              'absolute inset-0 rounded-2xl blur-xl opacity-40',
              animated && 'animate-pulse-slow'
            )}
            style={{ background: 'var(--gradient-button)' }}
          />
        )}
        
        <div
          className={cn(
            'relative flex items-center justify-center rounded-xl transition-transform',
            sizes.container,
            variant === 'gradient' && 'gradient-button shadow-lg',
            variant === 'default' && 'bg-primary',
            variant === 'minimal' && 'bg-primary/10',
            animated && 'hover:scale-105'
          )}
        >
          <Bot className={cn(
            sizes.icon,
            variant === 'minimal' ? 'text-primary' : 'text-white'
          )} />
          
          {/* Sparkle decoration for gradient variant */}
          {variant === 'gradient' && (size === 'lg' || size === 'xl') && (
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent" />
          )}
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold tracking-tight', sizes.text)}>
            DROOB AI
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-muted-foreground">Sales Booster</span>
          )}
        </div>
      )}
    </div>
  );
}

export function DroopAIAvatar({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };
  
  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  return (
    <div className={cn(
      'flex items-center justify-center rounded-xl gradient-button shadow-md',
      sizeMap[size],
      className
    )}>
      <Bot className={cn('text-white', iconSize[size])} />
    </div>
  );
}
