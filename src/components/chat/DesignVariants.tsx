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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{/* variants grid below */}</div>
    </div>
  ) && null;
}

// Replaced below

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3">
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
            {/* Preview header */}
            <div className={cn('h-28 bg-gradient-to-br relative overflow-hidden', variant.primaryColor)}>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3 text-center">
                {variant.logo && <div className="text-2xl mb-1">{variant.logo}</div>}
                <p className="text-sm font-bold leading-tight line-clamp-1">
                  {variant.storeName || variant.heroText || variant.name}
                </p>
                {variant.heroSubtext && (
                  <p className="text-[10px] opacity-90 mt-0.5 line-clamp-1">{variant.heroSubtext}</p>
                )}
              </div>
              {isApplied && (
                <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white text-primary flex items-center justify-center shadow-md">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            {/* Product emojis preview */}
            <div className={cn('flex justify-around py-2.5 px-3', variant.bgColor)}>
              {(variant.products || []).slice(0, 4).map((p, i) => (
                <div key={i} className="text-2xl" title={p.name}>{p.image}</div>
              ))}
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
                  <><Check className="h-3.5 w-3.5" /> مُطبَّق</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" /> تطبيق هذا التصميم</>
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
