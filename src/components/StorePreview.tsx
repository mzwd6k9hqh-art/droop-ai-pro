import React from 'react';
import { OnboardingResult } from '@/components/StoreOnboarding';
import { Store, ShoppingBag, Search, Heart, ShoppingCart, Menu, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorePreviewProps {
  storeContext: OnboardingResult | null;
}

const STORE_TYPE_COLORS: Record<string, { primary: string; accent: string; bg: string }> = {
  fashion: { primary: 'from-pink-500 to-rose-600', accent: 'bg-pink-100 text-pink-700', bg: 'bg-gradient-to-br from-rose-50 to-pink-50' },
  electronics: { primary: 'from-blue-500 to-indigo-600', accent: 'bg-blue-100 text-blue-700', bg: 'bg-gradient-to-br from-blue-50 to-indigo-50' },
  food: { primary: 'from-orange-500 to-amber-600', accent: 'bg-orange-100 text-orange-700', bg: 'bg-gradient-to-br from-orange-50 to-amber-50' },
  beauty: { primary: 'from-purple-500 to-fuchsia-600', accent: 'bg-purple-100 text-purple-700', bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50' },
  sports: { primary: 'from-green-500 to-emerald-600', accent: 'bg-green-100 text-green-700', bg: 'bg-gradient-to-br from-green-50 to-emerald-50' },
  books: { primary: 'from-amber-600 to-yellow-700', accent: 'bg-amber-100 text-amber-700', bg: 'bg-gradient-to-br from-amber-50 to-yellow-50' },
  kids: { primary: 'from-cyan-500 to-teal-600', accent: 'bg-cyan-100 text-cyan-700', bg: 'bg-gradient-to-br from-cyan-50 to-teal-50' },
  home: { primary: 'from-slate-600 to-stone-700', accent: 'bg-slate-100 text-slate-700', bg: 'bg-gradient-to-br from-slate-50 to-stone-50' },
};

const SAMPLE_PRODUCTS: Record<string, { name: string; price: string; image: string }[]> = {
  fashion: [
    { name: 'Classic Leather Jacket', price: '$129.99', image: '🧥' },
    { name: 'Summer Floral Dress', price: '$59.99', image: '👗' },
    { name: 'Designer Sneakers', price: '$89.99', image: '👟' },
    { name: 'Wool Winter Scarf', price: '$34.99', image: '🧣' },
  ],
  electronics: [
    { name: 'Wireless Earbuds Pro', price: '$79.99', image: '🎧' },
    { name: 'Smart Watch Ultra', price: '$249.99', image: '⌚' },
    { name: 'Portable Charger', price: '$39.99', image: '🔋' },
    { name: 'Bluetooth Speaker', price: '$59.99', image: '🔊' },
  ],
  food: [
    { name: 'Organic Coffee Beans', price: '$24.99', image: '☕' },
    { name: 'Artisan Chocolate Box', price: '$19.99', image: '🍫' },
    { name: 'Premium Tea Collection', price: '$29.99', image: '🍵' },
    { name: 'Gourmet Spice Set', price: '$34.99', image: '🌶️' },
  ],
  beauty: [
    { name: 'Vitamin C Serum', price: '$34.99', image: '✨' },
    { name: 'Rose Face Mask Set', price: '$24.99', image: '🌹' },
    { name: 'Hair Care Bundle', price: '$49.99', image: '💆' },
    { name: 'Natural Lip Balm', price: '$12.99', image: '💋' },
  ],
  sports: [
    { name: 'Yoga Mat Premium', price: '$49.99', image: '🧘' },
    { name: 'Resistance Band Set', price: '$29.99', image: '💪' },
    { name: 'Running Shoes Pro', price: '$119.99', image: '🏃' },
    { name: 'Water Bottle Steel', price: '$24.99', image: '🥤' },
  ],
  books: [
    { name: 'Business Strategy Guide', price: '$19.99', image: '📚' },
    { name: 'Creative Writing Kit', price: '$29.99', image: '✏️' },
    { name: 'Digital Marketing 101', price: '$24.99', image: '📖' },
    { name: 'Leadership Handbook', price: '$16.99', image: '📕' },
  ],
  kids: [
    { name: 'Educational Toy Set', price: '$34.99', image: '🧸' },
    { name: 'Kids Art Supplies', price: '$24.99', image: '🎨' },
    { name: 'Story Book Collection', price: '$19.99', image: '📚' },
    { name: 'Baby Care Bundle', price: '$44.99', image: '🍼' },
  ],
  home: [
    { name: 'Scented Candle Set', price: '$29.99', image: '🕯️' },
    { name: 'Throw Pillow Cover', price: '$19.99', image: '🛋️' },
    { name: 'Wall Art Print', price: '$39.99', image: '🖼️' },
    { name: 'Ceramic Vase', price: '$24.99', image: '🏺' },
  ],
};

export default function StorePreview({ storeContext }: StorePreviewProps) {
  if (!storeContext) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>لا توجد بيانات متجر حتى الآن</p>
      </div>
    );
  }

  if (storeContext.hasStore && storeContext.storeUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Store className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-xl font-bold mb-2">متجرك قيد التحليل</h2>
        <p className="text-muted-foreground mb-4">جاري تحليل متجرك وتقديم التحسينات</p>
        <a
          href={storeContext.storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          {storeContext.storeUrl}
        </a>
      </div>
    );
  }

  const type = storeContext.storeType || 'fashion';
  const colors = STORE_TYPE_COLORS[type] || STORE_TYPE_COLORS.fashion;
  const products = SAMPLE_PRODUCTS[type] || SAMPLE_PRODUCTS.fashion;
  const storeName = storeContext.storeName || 'My Store';

  return (
    <div className={cn('h-full overflow-y-auto', colors.bg)}>
      {/* Store Navbar */}
      <div className="bg-white/80 backdrop-blur border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Menu className="h-5 w-5 text-gray-600" />
          <h1 className={cn('text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent', colors.primary)}>
            {storeName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-gray-500" />
          <Heart className="h-5 w-5 text-gray-500" />
          <div className="relative">
            <ShoppingCart className="h-5 w-5 text-gray-500" />
            <span className={cn('absolute -top-2 -right-2 text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center bg-gradient-to-r', colors.primary)}>
              0
            </span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className={cn('mx-4 mt-4 rounded-2xl p-8 text-white bg-gradient-to-r', colors.primary)}>
        <p className="text-sm font-medium opacity-90 mb-1">مرحباً بك في</p>
        <h2 className="text-2xl font-bold mb-2">{storeName}</h2>
        <p className="text-sm opacity-80 mb-4">
          {storeContext.description || 'اكتشف أفضل المنتجات المختارة بعناية لك'}
        </p>
        <button className="bg-white/20 backdrop-blur px-5 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition">
          تسوّق الآن
        </button>
      </div>

      {/* Features */}
      <div className="flex gap-2 mx-4 mt-4 overflow-x-auto pb-2">
        {[
          { icon: Truck, text: 'شحن مجاني' },
          { icon: Shield, text: 'دفع آمن' },
          { icon: RotateCcw, text: 'إرجاع سهل' },
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-white/70 backdrop-blur rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 whitespace-nowrap border border-gray-100">
            <f.icon className="h-3.5 w-3.5" />
            {f.text}
          </div>
        ))}
      </div>

      {/* Products */}
      <div className="px-4 mt-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">المنتجات المميزة</h3>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', colors.accent)}>
            جديد
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {products.map((product, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-28 flex items-center justify-center bg-gray-50 text-4xl">
                {product.image}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-gray-900">{product.price}</span>
                  <button className={cn('p-1.5 rounded-lg text-white bg-gradient-to-r', colors.primary)}>
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 mt-4 border-t border-gray-200/50 text-center">
        <p className="text-xs text-gray-500">
          تم تصميمه بواسطة DROOP AI • {storeName}
        </p>
      </div>
    </div>
  );
}