import React from 'react';
import { cn } from '@/lib/utils';
import lightLogo from '@/assets/zyra-logo-light.png.asset.json';
import darkLogo from '@/assets/zyra-logo-dark.png.asset.json';
import { useTheme } from '@/contexts/ThemeContext';

interface ZyraMarkProps {
  className?: string;
  /** Renders the mark on a soft branded tile */
  tile?: boolean;
}

export function ZyraMark({ className, tile = false }: ZyraMarkProps) {
  const { theme } = useTheme();
  const img = (
    <img
      src={theme === 'dark' ? darkLogo.url : lightLogo.url}
      onError={event => {
        const fallback = theme === 'dark' ? '/favicon-dark.png' : '/favicon.png';
        if (!event.currentTarget.src.endsWith(fallback)) event.currentTarget.src = fallback;
      }}
      alt="ZYRA logo"
      className={cn('object-contain rounded-[inherit]', tile ? 'h-full w-full' : 'h-full w-full', !tile && className)}
      loading="eager"
    />
  );

  if (!tile) return img;

  return (
    <div className={cn('flex items-center justify-center overflow-hidden rounded-xl bg-card shadow-sm', className)}>
      {img}
    </div>
  );
}
