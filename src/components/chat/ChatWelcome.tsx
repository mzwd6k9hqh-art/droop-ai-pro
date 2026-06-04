import React from 'react';
import { Sparkles, Palette, ShoppingBag, Type, LayoutGrid, Search, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWelcomeProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  { icon: Palette, text: 'غيّر ألوان المتجر إلى الأزرق الداكن', label: 'تغيير الألوان' },
  { icon: ShoppingBag, text: 'أضف منتج جديد بسعر 99 ريال', label: 'إضافة منتج' },
  { icon: Type, text: 'غيّر اسم المتجر', label: 'تعديل الاسم' },
  { icon: LayoutGrid, text: 'غيّر تصميم المنتجات إلى قائمة', label: 'تغيير التصميم' },
  { icon: Search, text: 'ابحث عن أحدث اتجاهات التجارة الإلكترونية', label: 'بحث في الويب' },
  { icon: TrendingUp, text: 'اقترح طرق لزيادة مبيعات متجري', label: 'نصائح تسويقية' },
];

export function ChatWelcome({ onSuggestionClick }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
      {/* Logo */}
      <div className="relative mb-8">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
          <Sparkles className="h-8 w-8 text-primary-foreground" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-secondary flex items-center justify-center border-2 border-background">
          <div className="h-2 w-2 rounded-full bg-secondary-foreground" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">مرحباً، كيف أقدر أساعدك؟</h1>
      <p className="text-muted-foreground text-sm mb-10 max-w-md text-center">
        أنا مساعدك الذكي لبناء وإدارة متجرك. اسألني أي شيء أو اختر من الاقتراحات
      </p>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl w-full">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(s.text)}
            className={cn(
              'group flex items-center gap-3 p-4 rounded-xl text-right',
              'bg-card border border-border/60 hover:border-primary/30',
              'transition-all hover:shadow-md hover:-translate-y-0.5',
              'text-sm text-foreground'
            )}
          >
            <div className="h-9 w-9 shrink-0 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="leading-snug">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
