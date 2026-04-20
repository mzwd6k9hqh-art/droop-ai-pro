import React from 'react';
import { Check, Palette, Sparkles, RefreshCw, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DesignVariant {
  name: string;
  description: string;
  storeName?: string;
  storeType?: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  heroText?: string;
  heroSubtext?: string;
  heroButtonText?: string;
  logo?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  layout?: 'grid' | 'list';
  productColumns?: 2 | 3;
  features?: string[];
  categories?: string[];
  products?: { name: string; price: string; image: string; description?: string; badge?: string }[];
  testimonials?: { name: string; text: string; rating: number }[];
  banners?: { text: string; image?: string }[];
  faq?: { question: string; answer: string }[];
}

interface DesignVariantsProps {
  variants: DesignVariant[];
  appliedIndex?: number | null;
  onApply: (variant: DesignVariant, index: number) => void;
  onRegenerate?: () => void;
  onCustomize?: () => void;
}

export function DesignVariants({ variants, appliedIndex, onApply, onRegenerate, onCustomize }: DesignVariantsProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {variants.map((variant, idx) => {
          const isApplied = appliedIndex === idx;
          return (
            <div
              key={idx}
              className={cn(
                'group relative rounded-2xl border-2 overflow-hidden transition-all',
                'bg-card shadow-sm hover:shadow-md',
                isApplied ? 'border-primary ring-2 ring-primary/20' : 'border-border/50 hover:border-primary/40'
              )}
            >
              {/* Desktop + mobile mockup preview */}
              <div className={cn('relative h-36 bg-gradient-to-br overflow-hidden p-3', variant.primaryColor)}>
                <div className="absolute inset-0 opacity-[0.08]" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '14px 14px'
                }} />
                {/* Desktop frame */}
                <div className="absolute left-2 top-2 bottom-2 right-14 bg-white/95 rounded-md shadow-lg overflow-hidden flex flex-col">
                  <div className="h-2 bg-gray-200 flex items-center gap-0.5 px-1">
                    <div className="h-1 w-1 rounded-full bg-red-400" />
                    <div className="h-1 w-1 rounded-full bg-yellow-400" />
                    <div className="h-1 w-1 rounded-full bg-green-400" />
                  </div>
                  <div className={cn('flex-1 bg-gradient-to-br flex flex-col items-center justify-center text-white', variant.primaryColor)}>
                    {variant.logo && <div className="text-base">{variant.logo}</div>}
                    <p className="text-[7px] font-bold leading-tight px-1 truncate max-w-full">
                      {variant.storeName || variant.heroText || variant.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-0.5 p-1 bg-white">
                    {(variant.products || []).slice(0, 3).map((p, i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-sm flex items-center justify-center text-[10px]">{p.image}</div>
                    ))}
                  </div>
                </div>
                {/* Phone frame */}
                <div className="absolute right-2 top-3 bottom-3 w-10 bg-gray-900 rounded-lg p-0.5 shadow-xl">
                  <div className="h-full w-full bg-white rounded-md overflow-hidden flex flex-col">
                    <div className={cn('h-6 bg-gradient-to-br flex items-center justify-center text-white', variant.primaryColor)}>
                      <span className="text-[10px]">{variant.logo || '✨'}</span>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-0.5 p-0.5 bg-white">
                      {(variant.products || []).slice(0, 4).map((p, i) => (
                        <div key={i} className="bg-gray-100 rounded-sm flex items-center justify-center text-[8px]">{p.image}</div>
                      ))}
                    </div>
                  </div>
                </div>
                {isApplied && (
                  <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-white text-primary flex items-center justify-center shadow-md z-10">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Palette className="h-3 w-3 text-primary shrink-0" />
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1">{variant.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {variant.description}
                </p>
                <Button
                  size="sm"
                  onClick={() => onApply(variant, idx)}
                  disabled={isApplied}
                  className={cn(
                    'w-full h-8 rounded-lg text-xs gap-1.5',
                    isApplied
                      ? 'bg-primary/10 text-primary hover:bg-primary/10 cursor-default'
                      : 'gradient-button'
                  )}
                >
                  {isApplied ? (
                    <><Check className="h-3.5 w-3.5" /> Applied</>
                  ) : (
                    <><Sparkles className="h-3.5 w-3.5" /> Apply this design</>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action bar: Regenerate + Customize */}
      {(onRegenerate || onCustomize) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {onRegenerate && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRegenerate}
              className="h-9 rounded-lg text-xs gap-1.5 border-primary/30 hover:bg-primary/5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </Button>
          )}
          {onCustomize && (
            <Button
              size="sm"
              variant="outline"
              onClick={onCustomize}
              className="h-9 rounded-lg text-xs gap-1.5 border-primary/30 hover:bg-primary/5"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Customize manually
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
