import React from 'react';
import { ArrowRight, Star, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AllProductsPageProps {
  products: { name: string; price: string; image: string }[];
  primaryGradient: string;
  accentClasses: string;
  layout: 'grid' | 'list';
  onNavigate: (page: string, data?: any) => void;
}

export function AllProductsPage({ products, primaryGradient, accentClasses, layout, onNavigate }: AllProductsPageProps) {
  return (
    <div className="pb-6">
      <button onClick={() => onNavigate('home')}
        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 transition">
        <ArrowRight className="h-4 w-4" />
        الرئيسية
      </button>

      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">جميع المنتجات</h2>
          <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            تصفية
          </button>
        </div>

        <div className={cn('text-xs text-gray-500 mb-3')}>{products.length} منتج</div>

        <div className={cn(layout === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-3')}>
          {products.map((product, i) => (
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
                    onClick={(e) => e.stopPropagation()}>
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
