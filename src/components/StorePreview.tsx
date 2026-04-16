import React, { useState } from 'react';
import { OnboardingResult } from '@/components/StoreOnboarding';
import { Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreNavbar } from '@/components/store/StoreNavbar';
import { HomePage } from '@/components/store/pages/HomePage';
import { ProductDetailPage } from '@/components/store/pages/ProductDetailPage';
import { AllProductsPage } from '@/components/store/pages/AllProductsPage';
import { AboutPage } from '@/components/store/pages/AboutPage';
import { ContactPage } from '@/components/store/pages/ContactPage';
import { OffersPage } from '@/components/store/pages/OffersPage';

export interface StoreConfig {
  storeName?: string;
  description?: string;
  storeType?: string;
  primaryColor?: string;
  accentColor?: string;
  bgColor?: string;
  products?: { name: string; price: string; image: string; description?: string; category?: string; badge?: string; discount?: number; inStock?: boolean }[];
  heroText?: string;
  heroSubtext?: string;
  features?: string[];
  layout?: 'grid' | 'list';
  showHero?: boolean;
  currency?: string;
  // New expanded fields
  logo?: string;
  fontFamily?: string;
  announcement?: { text: string; show: boolean; bgColor?: string; textColor?: string };
  socialLinks?: { instagram?: string; twitter?: string; tiktok?: string; whatsapp?: string; facebook?: string; youtube?: string };
  navbarStyle?: 'default' | 'centered' | 'minimal';
  footerText?: string;
  footerLinks?: { label: string; page: string }[];
  categories?: string[];
  showSearch?: boolean;
  showCart?: boolean;
  showWishlist?: boolean;
  productColumns?: 2 | 3;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  heroButtonText?: string;
  heroImage?: string;
  testimonials?: { name: string; text: string; rating: number }[];
  banners?: { text: string; image?: string; link?: string }[];
  faq?: { question: string; answer: string }[];
  policies?: { shipping?: string; returns?: string; privacy?: string };
  pages?: {
    about?: {
      description?: string;
      subtitle?: string;
      stat1Label?: string;
      stat2Label?: string;
      stat3Label?: string;
    };
    contact?: {
      subtitle?: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    offers?: {
      title?: string;
      subtitle?: string;
    };
  };
}

interface StorePreviewProps {
  storeContext: OnboardingResult | null;
  storeConfig?: StoreConfig;
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

export default function StorePreview({ storeContext, storeConfig }: StorePreviewProps) {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState<any>(null);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    setPageData(data || null);
  };

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
        <a href={storeContext.storeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
          {storeContext.storeUrl}
        </a>
      </div>
    );
  }

  const type = storeConfig?.storeType || storeContext.storeType || 'fashion';
  const defaultColors = STORE_TYPE_COLORS[type] || STORE_TYPE_COLORS.fashion;

  const primaryGradient = storeConfig?.primaryColor || defaultColors.primary;
  const accentClasses = storeConfig?.accentColor || defaultColors.accent;
  const bgClasses = storeConfig?.bgColor || defaultColors.bg;

  const products = storeConfig?.products || SAMPLE_PRODUCTS[type] || SAMPLE_PRODUCTS.fashion;
  const storeName = storeConfig?.storeName || storeContext.storeName || 'My Store';

  const navPages = [
    { id: 'home', title: 'الرئيسية' },
    { id: 'products', title: 'جميع المنتجات' },
    { id: 'offers', title: 'العروض' },
    { id: 'about', title: 'من نحن' },
    { id: 'contact', title: 'تواصل معنا' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'product-detail':
        return (
          <ProductDetailPage
            product={pageData?.product || products[0]}
            primaryGradient={primaryGradient}
            storeName={storeName}
            onNavigate={handleNavigate}
          />
        );
      case 'products':
        return (
          <AllProductsPage
            products={products}
            primaryGradient={primaryGradient}
            accentClasses={accentClasses}
            layout={storeConfig?.layout || 'grid'}
            onNavigate={handleNavigate}
          />
        );
      case 'about':
        return (
          <AboutPage
            config={storeConfig || {}}
            primaryGradient={primaryGradient}
            onNavigate={handleNavigate}
          />
        );
      case 'contact':
        return (
          <ContactPage
            config={storeConfig || {}}
            primaryGradient={primaryGradient}
            onNavigate={handleNavigate}
          />
        );
      case 'offers':
        return (
          <OffersPage
            config={storeConfig || {}}
            primaryGradient={primaryGradient}
            products={products}
            onNavigate={handleNavigate}
          />
        );
      default:
        return (
          <HomePage
            config={storeConfig || { storeName, description: storeContext.description }}
            primaryGradient={primaryGradient}
            accentClasses={accentClasses}
            products={products}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className={cn('h-full overflow-y-auto relative', bgClasses)}>
      <StoreNavbar
        storeName={storeName}
        primaryGradient={primaryGradient}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        pages={navPages}
        config={storeConfig}
      />
      {renderPage()}
      {/* Footer */}
      <div className="px-4 py-6 mt-4 border-t border-gray-200/50">
        {/* Social Links */}
        {storeConfig?.socialLinks && (
          <div className="flex justify-center gap-4 mb-3">
            {Object.entries(storeConfig.socialLinks).map(([platform, link]) => (
              link && <span key={platform} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer capitalize">{platform}</span>
            ))}
          </div>
        )}
        {/* Footer Links */}
        {storeConfig?.footerLinks && storeConfig.footerLinks.length > 0 && (
          <div className="flex justify-center gap-4 mb-3">
            {storeConfig.footerLinks.map((link, i) => (
              <button key={i} onClick={() => handleNavigate(link.page)} className="text-xs text-gray-500 hover:text-gray-700">
                {link.label}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 text-center">
          {storeConfig?.footerText || `تم تصميمه بواسطة DROOB AI • ${storeName}`}
        </p>
        {/* Policies */}
        {storeConfig?.policies && (
          <div className="flex justify-center gap-3 mt-2">
            {storeConfig.policies.shipping && <span className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600">سياسة الشحن</span>}
            {storeConfig.policies.returns && <span className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600">الاسترجاع</span>}
            {storeConfig.policies.privacy && <span className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600">الخصوصية</span>}
          </div>
        )}
      </div>
    </div>
  );
}