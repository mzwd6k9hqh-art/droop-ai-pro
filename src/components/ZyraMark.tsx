import React from 'react';
import { cn } from '@/lib/utils';
import zyraLogo from '@/assets/zyra-logo.png.asset.json';

interface ZyraMarkProps {
  className?: string;
  /** Renders the mark on a soft branded tile */
  tile?: boolean;
}

export function ZyraMark({ className, tile = false }: ZyraMarkProps) {
  const img = (
    <img
      src={zyraLogo.url}
      alt="ZYRA logo"
      className={cn('object-contain', tile ? 'h-2/3 w-2/3' : 'h-full w-full', !tile && className)}
      loading="eager"
    />
  );

  if (!tile) return img;

  return (
    <div className={cn('flex items-center justify-center rounded-xl bg-white/95 shadow-sm', className)}>
      {img}
    </div>
  );
}
