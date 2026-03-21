import React from 'react';
import { Search, Heart, ShoppingCart, Menu, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreConfig } from '@/components/StorePreview';

interface StoreNavbarProps {
  storeName: string;
  primaryGradient: string;
  cartCount?: number;
  currentPage: string;
  onNavigate: (page: string) => void;
  pages: { id: string; title: string }[];
  config?: StoreConfig;
}

export function StoreNavbar({ storeName, primaryGradient, cartCount = 0, currentPage, onNavigate, pages, config }: StoreNavbarProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const showSearch = config?.showSearch !== false;
  const showCart = config?.showCart !== false;
  const showWishlist = config?.showWishlist !== false;
  const logo = config?.logo;
  const style = config?.navbarStyle || 'default';

  return (
    <>
      {/* Announcement Bar */}
      {config?.announcement?.show && config.announcement.text && (
        <div
          className={cn('px-4 py-2 text-center text-xs font-medium', config.announcement.bgColor || 'bg-gray-900', config.announcement.textColor || 'text-white')}
        >
          {config.announcement.text}
        </div>
      )}

      <div className={cn(
        'bg-white/80 backdrop-blur border-b px-4 py-3 flex items-center sticky top-0 z-10',
        style === 'centered' ? 'justify-center gap-6' : 'justify-between'
      )}>
        <div className="flex items-center gap-3">
          {style !== 'minimal' && (
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
            {logo && <span className="text-xl">{logo}</span>}
            <h1 className={cn('text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent', primaryGradient)}>
              {storeName}
            </h1>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {showSearch && <Search className="h-5 w-5 text-gray-500" />}
          {showWishlist && <Heart className="h-5 w-5 text-gray-500" />}
          {showCart && (
            <div className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-500" />
              <span className={cn('absolute -top-2 -right-2 text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center bg-gradient-to-r', primaryGradient)}>
                {cartCount}
              </span>
            </div>
          )}
        </div>
      </div>

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
