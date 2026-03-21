import React from 'react';
import { Search, Heart, ShoppingCart, Menu, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoreNavbarProps {
  storeName: string;
  primaryGradient: string;
  cartCount?: number;
  currentPage: string;
  onNavigate: (page: string) => void;
  pages: { id: string; title: string }[];
}

export function StoreNavbar({ storeName, primaryGradient, cartCount = 0, currentPage, onNavigate, pages }: StoreNavbarProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <>
      <div className="bg-white/80 backdrop-blur border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <button onClick={() => onNavigate('home')}>
            <h1 className={cn('text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent', primaryGradient)}>
              {storeName}
            </h1>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-gray-500" />
          <Heart className="h-5 w-5 text-gray-500" />
          <div className="relative">
            <ShoppingCart className="h-5 w-5 text-gray-500" />
            <span className={cn('absolute -top-2 -right-2 text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center bg-gradient-to-r', primaryGradient)}>
              {cartCount}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation menu dropdown */}
      {menuOpen && (
        <div className="absolute top-[53px] left-0 right-0 bg-white border-b shadow-lg z-20 animate-in slide-in-from-top-2 duration-200">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => { onNavigate(page.id); setMenuOpen(false); }}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition border-b border-gray-50 last:border-0',
                currentPage === page.id && 'text-gray-900 bg-gray-50'
              )}
            >
              {page.title}
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
