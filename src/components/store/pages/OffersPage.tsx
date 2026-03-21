import React from 'react';
import { ArrowRight, Percent, Clock, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreConfig } from '@/components/StorePreview';

interface OffersPageProps {
  config: StoreConfig;
  primaryGradient: string;
  products: { name: string; price: string; image: string }[];
  onNavigate: (page: string, data?: any) => void;
}

export function OffersPage({ config, primaryGradient, products, onNavigate }: OffersPageProps) {
  const offers = config.pages?.offers || {};

  return (
    <div className="pb-6">
      <button onClick={() => onNavigate('home')}
        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 transition">
        <ArrowRight className="h-4 w-4" />
        الرئيسية
      </button>

      <div className="px-4 space-y-6">
        <div className={cn('rounded-2xl p-6 text-white bg-gradient-to-r', primaryGradient)}>
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-6 w-6" />
            <h2 className="text-xl font-bold">{offers.title || 'العروض الخاصة'}</h2>
          </div>
          <p className="text-sm opacity-90">{offers.subtitle || 'لا تفوّت أفضل العروض والخصومات!'}</p>
          <div className="flex items-center gap-2 mt-3 bg-white/20 rounded-lg px-3 py-2 w-fit">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">العرض ينتهي قريباً</span>
          </div>
        </div>

        <div className="space-y-3">
          {products.slice(0, 3).map((product, i) => {
            const discount = [30, 20, 15][i];
            return (
              <div key={i}
                onClick={() => onNavigate('product-detail', { product })}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 cursor-pointer hover:shadow-md transition">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-lg text-3xl flex-shrink-0">
                  {product.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-gray-900">{product.price}</span>
                    <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full font-medium">-{discount}%</span>
                  </div>
                </div>
                <button className={cn('p-2 rounded-lg text-white bg-gradient-to-r', primaryGradient)}
                  onClick={(e) => e.stopPropagation()}>
                  <ShoppingBag className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
