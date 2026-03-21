import React from 'react';
import { ArrowRight, Users, Target, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreConfig } from '@/components/StorePreview';

interface AboutPageProps {
  config: StoreConfig;
  primaryGradient: string;
  onNavigate: (page: string) => void;
}

export function AboutPage({ config, primaryGradient, onNavigate }: AboutPageProps) {
  const storeName = config.storeName || 'My Store';
  const about = config.pages?.about || {};

  return (
    <div className="pb-6">
      <button onClick={() => onNavigate('home')}
        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 transition">
        <ArrowRight className="h-4 w-4" />
        الرئيسية
      </button>

      <div className="px-4 space-y-6">
        <div className={cn('rounded-2xl p-6 text-white bg-gradient-to-r', primaryGradient)}>
          <h2 className="text-xl font-bold mb-2">من نحن</h2>
          <p className="text-sm opacity-90">{about.subtitle || `تعرّف على قصة ${storeName}`}</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {about.description || `${storeName} هو متجرك الموثوق للحصول على أفضل المنتجات بأعلى جودة وأفضل الأسعار. نحن نسعى دائماً لتقديم تجربة تسوق فريدة ومميزة لعملائنا.`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: about.stat1Label || '+1000 عميل', sub: 'عملاء سعداء' },
            { icon: Target, label: about.stat2Label || '+500 منتج', sub: 'منتج متنوع' },
            { icon: Award, label: about.stat3Label || '5 سنوات', sub: 'خبرة' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <item.icon className="h-6 w-6 mx-auto text-gray-600 mb-2" />
              <p className="text-sm font-bold text-gray-900">{item.label}</p>
              <p className="text-[10px] text-gray-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
