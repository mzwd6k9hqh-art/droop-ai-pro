import React from 'react';
import { ShoppingBag, Star, Truck, Shield, RotateCcw, MessageSquare, ArrowLeft, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreConfig } from '@/components/StorePreview';
import { getStoreName } from '@/lib/storeName';

interface HomePageProps {
  config: StoreConfig;
  primaryGradient: string;
  accentClasses: string;
  products: { name: string; price: string; image: string; badge?: string; discount?: number; inStock?: boolean }[];
  onNavigate: (page: string, data?: any) => void;
}

export function HomePage({ config, primaryGradient, accentClasses, products, onNavigate }: HomePageProps) {
  const heroText = config.heroText || config.storeName || getStoreName();
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
    sm: 'rounded-md',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-3xl',
  }[borderRadius];

  const heroEmoji = config.heroImage || config.logo || '✨';

  return (
    <div className="bg-white">
      {/* HERO — full-bleed, editorial style */}
      {showHero && (
        <section className={cn('relative overflow-hidden text-white bg-gradient-to-br', primaryGradient)}>
          {/* decorative blobs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-black/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />

          <div className="relative px-5 pt-8 pb-10">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-[11px] font-medium mb-4">
              <Sparkles className="h-3 w-3" />
              مجموعة جديدة 2025
            </div>

            <h1 className="text-4xl font-black leading-[1.1] tracking-tight mb-3">
              {heroText}
            </h1>
            <p className="text-sm opacity-90 leading-relaxed mb-6 max-w-[280px]">
              {heroSubtext}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('products')}
                className="group bg-white text-gray-900 px-5 py-3 rounded-full text-sm font-bold inline-flex items-center gap-2 hover:gap-3 transition-all shadow-xl shadow-black/20"
              >
                {heroButtonText}
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('offers')}
                className="text-sm font-semibold underline-offset-4 hover:underline"
              >
                العروض ←
              </button>
            </div>

            {/* Hero visual card */}
            <div className="mt-8 relative">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex items-center justify-between">
                <div className="text-7xl drop-shadow-2xl">{heroEmoji}</div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Featured</div>
                  <div className="font-bold text-sm">{products[0]?.name || 'منتج مميز'}</div>
                  <div className="text-xs opacity-80 mt-1">{products[0]?.price || ''}</div>
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-6 grid grid-cols-3 gap-2 pt-5 border-t border-white/15">
              <div>
                <div className="text-2xl font-black">10K+</div>
                <div className="text-[10px] opacity-80 uppercase tracking-wider">عميل سعيد</div>
              </div>
              <div>
                <div className="text-2xl font-black">{products.length || 50}+</div>
                <div className="text-[10px] opacity-80 uppercase tracking-wider">منتج</div>
              </div>
              <div>
                <div className="text-2xl font-black">4.9★</div>
                <div className="text-[10px] opacity-80 uppercase tracking-wider">تقييم</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust strip */}
      <div className="border-y border-gray-100 bg-gray-50/60">
        <div className="flex gap-4 mx-4 py-3 overflow-x-auto">
          {featuresList.map((text, i) => {
            const Icon = featureIcons[i % featureIcons.length];
            return (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                <div className={cn('p-1.5 rounded-lg bg-gradient-to-br text-white', primaryGradient)}>
                  <Icon className="h-3 w-3" />
                </div>
                {text}
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories — rich tiles */}
      {config.categories && config.categories.length > 0 && (
        <section className="px-4 pt-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h3 className="font-black text-gray-900 text-lg">تسوّق حسب الفئة</h3>
              <p className="text-xs text-gray-500 mt-0.5">اكتشف ما يناسب ذوقك</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {config.categories.slice(0, 6).map((cat, i) => (
              <button
                key={i}
                className={cn(
                  'group relative aspect-square overflow-hidden border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all',
                  radiusClass
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {['👗','👜','👟','💄','⌚','🎁'][i % 6]}
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="text-[10px] font-bold text-white truncate">{cat}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Promo banners */}
      {config.banners && config.banners.length > 0 && (
        <section className="px-4 mt-6 space-y-3">
          {config.banners.map((banner, i) => (
            <div
              key={i}
              onClick={() => banner.link && onNavigate(banner.link)}
              className={cn('relative overflow-hidden p-5 bg-gradient-to-r text-white flex items-center justify-between cursor-pointer shadow-lg', primaryGradient, radiusClass)}
            >
              <div>
                <div className="text-[10px] uppercase tracking-widest opacity-80 mb-1">عرض خاص</div>
                <p className="text-base font-bold leading-tight">{banner.text}</p>
              </div>
              {banner.image && <span className="text-5xl drop-shadow-xl">{banner.image}</span>}
            </div>
          ))}
        </section>
      )}

      {/* Featured products */}
      <section className="px-4 mt-8 mb-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold mb-1" style={{ color: 'currentColor' }}>
              <TrendingUp className={cn('h-3.5 w-3.5')} />
              <span className={cn('px-2 py-0.5 rounded-full', accentClasses)}>الأكثر طلباً</span>
            </div>
            <h3 className="font-black text-gray-900 text-lg">المنتجات المميزة</h3>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-gray-700 hover:text-gray-900 inline-flex items-center gap-1"
          >
            عرض الكل <ArrowLeft className="h-3 w-3" />
          </button>
        </div>

        <div className={cn(
          layout === 'list' ? 'flex flex-col gap-3' : 'grid gap-3',
          layout !== 'list' && (columns === 3 ? 'grid-cols-3' : 'grid-cols-2')
        )}>
          {products.slice(0, columns === 3 ? 6 : 4).map((product, i) => (
            <div
              key={i}
              onClick={() => onNavigate('product-detail', { product })}
              className={cn(
                'group bg-white border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer relative',
                radiusClass,
                layout === 'list' && 'flex flex-row',
                product.inStock === false && 'opacity-60'
              )}
            >
              {product.badge && (
                <span className={cn('absolute top-2.5 right-2.5 text-[9px] px-2 py-0.5 text-white font-bold z-[1] bg-gradient-to-r rounded-full uppercase tracking-wider', primaryGradient)}>
                  {product.badge}
                </span>
              )}
              <div className={cn(
                'flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-5xl relative overflow-hidden',
                layout === 'list' ? 'w-28 h-28 shrink-0' : (columns === 3 ? 'h-24' : 'aspect-square')
              )}>
                <span className="group-hover:scale-110 transition-transform">{product.image}</span>
                {product.discount && product.discount > 0 && (
                  <span className="absolute top-2 left-2 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-md font-black shadow">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <div className="p-3 flex-1">
                <p className={cn('font-bold text-gray-900 truncate', columns === 3 ? 'text-[11px]' : 'text-sm')}>{product.name}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={cn('fill-yellow-400 text-yellow-400', columns === 3 ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1">(127)</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={cn('font-black text-gray-900', columns === 3 ? 'text-xs' : 'text-base')}>{product.price}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className={cn('p-2 text-white bg-gradient-to-br shadow-md hover:shadow-lg transition-all', primaryGradient, radiusClass)}
                  >
                    <ShoppingBag className={cn(columns === 3 ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
                  </button>
                </div>
                {product.inStock === false && (
                  <p className="text-[10px] text-red-500 mt-1 font-semibold">نفذ المخزون</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial CTA band */}
      <section className="mx-4 mb-8">
        <div className={cn('relative overflow-hidden p-6 bg-gradient-to-br text-white', primaryGradient, radiusClass)}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest opacity-80 mb-2">قصتنا</div>
            <h3 className="text-xl font-black mb-2 leading-tight">صُنع بحب، مُختار بعناية</h3>
            <p className="text-xs opacity-90 leading-relaxed mb-4 max-w-[260px]">
              كل منتج في متجرنا يمر بفحص دقيق لضمان الجودة العالية وتجربة لا تُنسى.
            </p>
            <button
              onClick={() => onNavigate('about')}
              className="bg-white/15 backdrop-blur border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white/25 transition"
            >
              تعرّف علينا ←
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {config.testimonials && config.testimonials.length > 0 && (
        <section className="px-4 mb-8">
          <div className="text-center mb-5">
            <div className={cn('inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2', accentClasses)}>
              التقييمات
            </div>
            <h3 className="font-black text-gray-900 text-xl">ماذا يقول عملاؤنا</h3>
          </div>
          <div className="space-y-3">
            {config.testimonials.map((t, i) => (
              <div key={i} className={cn('bg-white border border-gray-100 p-4 shadow-sm', radiusClass)}>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={cn('h-3.5 w-3.5', j < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200')} />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className={cn('h-8 w-8 rounded-full bg-gradient-to-br text-white flex items-center justify-center text-xs font-bold', primaryGradient)}>
                    {t.name.charAt(0)}
                  </div>
                  <p className="text-xs font-bold text-gray-900">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {config.faq && config.faq.length > 0 && (
        <section className="px-4 mb-8">
          <h3 className="font-black text-gray-900 text-lg mb-4">الأسئلة الشائعة</h3>
          <div className="space-y-2">
            {config.faq.map((item, i) => (
              <details key={i} className={cn('bg-white border border-gray-100 overflow-hidden group', radiusClass)}>
                <summary className="px-4 py-3.5 text-sm font-bold text-gray-900 cursor-pointer hover:bg-gray-50 list-none flex items-center justify-between">
                  <span>{item.question}</span>
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
