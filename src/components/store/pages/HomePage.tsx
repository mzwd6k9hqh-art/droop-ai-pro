import React from 'react';
import { ShoppingBag, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreConfig } from '@/components/StorePreview';

interface HomePageProps {
  config: StoreConfig;
  primaryGradient: string;
  accentClasses: string;
  products: { name: string; price: string; image: string }[];
  onNavigate: (page: string, data?: any) => void;
}

export function HomePage({ config, primaryGradient, accentClasses, products, onNavigate }: HomePageProps) {
  const heroText = config.heroText || config.storeName || 'My Store';
  const heroSubtext = config.heroSubtext || config.description || 'اكتشف أفضل المنتجات المختارة بعناية لك';
  const showHero = config.showHero !== false;
  const layout = config.layout || 'grid';
  const featuresList = config.features || ['شحن مجاني', 'دفع آمن', 'إرجاع سهل'];
  const featureIcons = [Truck, Shield, RotateCcw];

  return (
    <>
      {/* Hero Banner */}
      {showHero && (
        <div className={cn('mx-4 mt-4 rounded-2xl p-8 text-white bg-gradient-to-r cursor-pointer', primaryGradient)}
          onClick={() => onNavigate('products')}>
          <p className="text-sm font-medium opacity-90 mb-1">مرحباً بك في</p>
          <h2 className="text-2xl font-bold mb-2">{heroText}</h2>
          <p className="text-sm opacity-80 mb-4">{heroSubtext}</p>
          <button className="bg-white/20 backdrop-blur px-5 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition"
            onClick={(e) => { e.stopPropagation(); onNavigate('products'); }}>
            تسوّق الآن
          </button>
        </div>
      )}

      {/* Features */}
      <div className="flex gap-2 mx-4 mt-4 overflow-x-auto pb-2">
        {featuresList.map((text, i) => {
          const Icon = featureIcons[i % featureIcons.length];
          return (
            <div key={i} className="flex items-center gap-1.5 bg-white/70 backdrop-blur rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 whitespace-nowrap border border-gray-100">
              <Icon className="h-3.5 w-3.5" />
              {text}
            </div>
          );
        })}
      </div>

      {/* Products */}
      <div className="px-4 mt-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">المنتجات المميزة</h3>
          <button onClick={() => onNavigate('products')}
            className={cn('text-xs font-medium px-2 py-0.5 rounded-full', accentClasses)}>
            عرض الكل
          </button>
        </div>
        <div className={cn(layout === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-3')}>
          {products.slice(0, 4).map((product, i) => (
            <div key={i}
              onClick={() => onNavigate('product-detail', { product })}
              className={cn(
                'bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer',
                layout === 'list' && 'flex flex-row'
              )}>
              <div className={cn(
                'flex items-center justify-center bg-gray-50 text-4xl',
                layout === 'list' ? 'w-24 h-24' : 'h-28'
              )}>
                {product.image}
              </div>
              <div className="p-3 flex-1">
                <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-gray-900">{product.price}</span>
                  <button className={cn('p-1.5 rounded-lg text-white bg-gradient-to-r', primaryGradient)}
                    onClick={(e) => { e.stopPropagation(); }}>
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
