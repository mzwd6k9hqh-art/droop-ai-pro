import React from 'react';
import { ArrowRight, Star, ShoppingCart, Heart, Share2, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductDetailPageProps {
  product: { name: string; price: string; image: string };
  primaryGradient: string;
  storeName: string;
  onNavigate: (page: string, data?: any) => void;
}

export function ProductDetailPage({ product, primaryGradient, storeName, onNavigate }: ProductDetailPageProps) {
  const [qty, setQty] = React.useState(1);

  return (
    <div className="pb-6">
      {/* Back button */}
      <button onClick={() => onNavigate('home')}
        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 transition">
        <ArrowRight className="h-4 w-4" />
        العودة للرئيسية
      </button>

      {/* Product image */}
      <div className="mx-4 rounded-2xl bg-gray-50 flex items-center justify-center h-56 text-8xl">
        {product.image}
      </div>

      {/* Product info */}
      <div className="px-4 mt-4 space-y-4">
        <div>
          <p className="text-xs text-gray-500">{storeName}</p>
          <h2 className="text-xl font-bold text-gray-900 mt-1">{product.name}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-xs text-gray-500">(128 تقييم)</span>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          منتج مميز من {storeName}. جودة عالية وتصميم أنيق يناسب جميع الأذواق.
          متوفر بعدة خيارات وألوان مختلفة.
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">{product.price}</span>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('home')} className="p-2 rounded-full border border-gray-200 hover:bg-gray-50">
              <Share2 className="h-4 w-4 text-gray-500" />
            </button>
            <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50">
              <Heart className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">الكمية:</span>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-gray-50">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-gray-50">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Add to cart button */}
        <button className={cn('w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 bg-gradient-to-r', primaryGradient)}>
          <ShoppingCart className="h-5 w-5" />
          أضف إلى السلة
        </button>
      </div>
    </div>
  );
}
