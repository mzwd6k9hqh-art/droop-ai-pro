import React from 'react';
import { ShoppingBag, Star, Truck, Shield, RotateCcw, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreConfig } from '@/components/StorePreview';

interface HomePageProps {
  config: StoreConfig;
  primaryGradient: string;
  accentClasses: string;
  products: { name: string; price: string; image: string; badge?: string; discount?: number; inStock?: boolean }[];
  onNavigate: (page: string, data?: any) => void;
}

export function HomePage({ config, primaryGradient, accentClasses, products, onNavigate }: HomePageProps) {
  const heroText = config.heroText || config.storeName || 'My Store';
  const heroSubtext = config.heroSubtext || config.description || 'اكتشف أفضل المنتجات المختارة بعناية لك';
  const showHero = config.showHero !== false;
  const layout = config.layout || 'grid';
  const featuresList = config.features || ['شحن مجاني', 'دفع آمن', 'إرجاع سهل'];
  const featureIcons = [Truck, Shield, RotateCcw];
  const columns = config.productColumns || 2;
  const borderRadius = config.borderRadius || 'lg';
  const heroButtonText = config.heroButtonText || 'تسوّق الآن';

  const radiusClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-xl',
    full: 'rounded-2xl',
  }[borderRadius];

  return (
    <>
      {/* Hero Banner */}
      {showHero && (
        <div className={cn('mx-4 mt-4 p-8 text-white bg-gradient-to-r cursor-pointer', primaryGradient, radiusClass === 'rounded-2xl' ? 'rounded-2xl' : radiusClass)}
          onClick={() => onNavigate('products')}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium opacity-90 mb-1">مرحباً بك في</p>
              <h2 className="text-2xl font-bold mb-2">{heroText}</h2>
              <p className="text-sm opacity-80 mb-4">{heroSubtext}</p>
              <button className="bg-white/20 backdrop-blur px-5 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition"
                onClick={(e) => { e.stopPropagation(); onNavigate('products'); }}>
                {heroButtonText}
              </button>
            </div>
            {config.heroImage && (
              <span className="text-5xl">{config.heroImage}</span>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      {config.categories && config.categories.length > 0 && (
        <div className="flex gap-2 mx-4 mt-4 overflow-x-auto pb-2">
          {config.categories.map((cat, i) => (
            <button key={i} className={cn('px-4 py-2 text-xs font-medium whitespace-nowrap border border-gray-200 bg-white hover:bg-gray-50 transition', radiusClass)}>
              {cat}
            </button>
          ))}
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

      {/* Promotional Banners */}
      {config.banners && config.banners.length > 0 && (
        <div className="px-4 mt-4 space-y-3">
          {config.banners.map((banner, i) => (
            <div key={i} className={cn('p-4 bg-gradient-to-r text-white flex items-center gap-3', primaryGradient, radiusClass)}
              onClick={() => banner.link && onNavigate(banner.link)}>
              {banner.image && <span className="text-3xl">{banner.image}</span>}
              <p className="text-sm font-medium">{banner.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      <div className="px-4 mt-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">المنتجات المميزة</h3>
          <button onClick={() => onNavigate('products')}
            className={cn('text-xs font-medium px-2 py-0.5 rounded-full', accentClasses)}>
            عرض الكل
          </button>
        </div>
        <div className={cn(
          layout === 'list' ? 'flex flex-col gap-3' : 'grid gap-3',
          layout !== 'list' && (columns === 3 ? 'grid-cols-3' : 'grid-cols-2')
        )}>
          {products.slice(0, columns === 3 ? 6 : 4).map((product, i) => (
            <div key={i}
              onClick={() => onNavigate('product-detail', { product })}
              className={cn(
                'bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer relative',
                radiusClass,
                layout === 'list' && 'flex flex-row',
                product.inStock === false && 'opacity-60'
              )}>
              {/* Badge */}
              {product.badge && (
                <span className={cn('absolute top-2 right-2 text-[10px] px-2 py-0.5 text-white font-medium z-[1] bg-gradient-to-r', primaryGradient, radiusClass)}>
                  {product.badge}
                </span>
              )}
              <div className={cn(
                'flex items-center justify-center bg-gray-50 text-4xl relative',
                layout === 'list' ? 'w-24 h-24' : (columns === 3 ? 'h-20' : 'h-28')
              )}>
                {product.image}
                {product.discount && product.discount > 0 && (
                  <span className="absolute top-1 left-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <div className="p-3 flex-1">
                <p className={cn('font-medium text-gray-800 truncate', columns === 3 ? 'text-[10px]' : 'text-xs')}>{product.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={cn('fill-yellow-400 text-yellow-400', columns === 3 ? 'h-2 w-2' : 'h-3 w-3')} />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={cn('font-bold text-gray-900', columns === 3 ? 'text-xs' : 'text-sm')}>{product.price}</span>
                  <button className={cn('p-1.5 text-white bg-gradient-to-r', primaryGradient, radiusClass)}
                    onClick={(e) => { e.stopPropagation(); }}>
                    <ShoppingBag className={cn(columns === 3 ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
                  </button>
                </div>
                {product.inStock === false && (
                  <p className="text-[10px] text-red-500 mt-1">نفذ المخزون</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      {config.testimonials && config.testimonials.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> آراء العملاء
          </h3>
          <div className="space-y-3">
            {config.testimonials.map((t, i) => (
              <div key={i} className={cn('bg-white border border-gray-100 p-4', radiusClass)}>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={cn('h-3 w-3', j < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200')} />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-2">"{t.text}"</p>
                <p className="text-xs font-medium text-gray-500">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {config.faq && config.faq.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">الأسئلة الشائعة</h3>
          <div className="space-y-2">
            {config.faq.map((item, i) => (
              <details key={i} className={cn('bg-white border border-gray-100 overflow-hidden', radiusClass)}>
                <summary className="px-4 py-3 text-sm font-medium text-gray-800 cursor-pointer hover:bg-gray-50">
                  {item.question}
                </summary>
                <p className="px-4 pb-3 text-sm text-gray-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
