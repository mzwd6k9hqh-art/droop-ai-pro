import React from 'react';
import { ArrowRight, Mail, Phone, MapPin, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreConfig } from '@/components/StorePreview';

interface ContactPageProps {
  config: StoreConfig;
  primaryGradient: string;
  onNavigate: (page: string) => void;
}

export function ContactPage({ config, primaryGradient, onNavigate }: ContactPageProps) {
  const contact = config.pages?.contact || {};

  return (
    <div className="pb-6">
      <button onClick={() => onNavigate('home')}
        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 transition">
        <ArrowRight className="h-4 w-4" />
        الرئيسية
      </button>

      <div className="px-4 space-y-6">
        <div className={cn('rounded-2xl p-6 text-white bg-gradient-to-r', primaryGradient)}>
          <h2 className="text-xl font-bold mb-2">تواصل معنا</h2>
          <p className="text-sm opacity-90">{contact.subtitle || 'نحب أن نسمع منك!'}</p>
        </div>

        <div className="space-y-3">
          {[
            { icon: Mail, label: contact.email || 'info@store.com' },
            { icon: Phone, label: contact.phone || '+966 50 000 0000' },
            { icon: MapPin, label: contact.address || 'الرياض، المملكة العربية السعودية' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4">
              <div className={cn('p-2 rounded-lg text-white bg-gradient-to-r', primaryGradient)}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Contact form preview */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">أرسل لنا رسالة</h3>
          <input placeholder="الاسم" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" readOnly />
          <input placeholder="البريد الإلكتروني" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" readOnly />
          <textarea placeholder="رسالتك..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white h-24 resize-none" readOnly />
          <button className={cn('w-full py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 bg-gradient-to-r', primaryGradient)}>
            <Send className="h-4 w-4" />
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}
