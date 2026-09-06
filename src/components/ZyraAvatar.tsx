import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ZyraMark } from '@/components/ZyraMark';
import { cn } from '@/lib/utils';
import { loadAppearance, type Appearance, type AvatarStyle } from '@/lib/appearance';

export function ZyraAvatar({
  className,
  style,
  color,
  size = 'md',
}: {
  className?: string;
  style?: AvatarStyle;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [appearance, setAppearance] = useState<Appearance>(() => loadAppearance());

  useEffect(() => {
    const onChange = (e: Event) => setAppearance((e as CustomEvent).detail || loadAppearance());
    window.addEventListener('zyra-appearance-changed', onChange);
    return () => window.removeEventListener('zyra-appearance-changed', onChange);
  }, []);

  const variant = style || appearance.avatar;
  const accent = color || appearance.avatarColor;
  const box = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  const inner = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';

  if (variant === 'sparkle') {
    return (
      <div
        className={cn('flex shrink-0 items-center justify-center rounded-full text-white shadow-sm', box, className)}
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
      >
        <Sparkles className={inner} />
      </div>
    );
  }

  if (variant === 'orb') {
    return (
      <div
        className={cn('shrink-0 rounded-full shadow-sm animate-pulse', box, className)}
        style={{ background: `radial-gradient(circle at 30% 30%, #fff8, ${accent})` }}
        aria-hidden
      />
    );
  }

  if (variant === 'initial') {
    return (
      <div
        className={cn('flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm', box, className)}
        style={{ backgroundColor: accent, fontSize: size === 'lg' ? 18 : 12 }}
      >
        Z
      </div>
    );
  }

  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm', box, className)}>
      <ZyraMark className={inner} style={{ color: accent }} />
    </div>
  );
}
