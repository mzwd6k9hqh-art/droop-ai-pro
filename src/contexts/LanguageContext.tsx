import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface Translations {
  [key: string]: { en: string; ar: string; fr: string };
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم', fr: 'Tableau de bord' },
  'nav.analytics': { en: 'Analytics', ar: 'التحليلات', fr: 'Analytique' },
  'nav.droopai': { en: 'Zyra', ar: 'زيرا', fr: 'Zyra' },
  'nav.pricing': { en: 'Pricing', ar: 'الأسعار', fr: 'Tarification' },
  'nav.settings': { en: 'Settings', ar: 'الإعدادات', fr: 'Paramètres' },
  'nav.logout': { en: 'Logout', ar: 'تسجيل الخروج', fr: 'Déconnexion' },
  'nav.customers': { en: 'Customers', ar: 'العملاء', fr: 'Clients' },
  'nav.earnings': { en: 'Earnings', ar: 'الأرباح', fr: 'Revenus' },

  // Dashboard
  'dashboard.welcome': { en: 'Welcome back', ar: 'مرحباً بعودتك', fr: 'Bon retour' },
  'dashboard.insights': { en: 'AI-powered business insights.', ar: 'رؤى أعمال مدعومة بالذكاء الاصطناعي.', fr: 'Insights commerciaux par IA.' },
  'dashboard.markets': { en: 'Top Global Markets', ar: 'أفضل الأسواق العالمية', fr: 'Marchés mondiaux' },
  'dashboard.countries': { en: 'Best Countries to Start', ar: 'أفضل الدول للبدء', fr: 'Meilleurs pays pour commencer' },
  'dashboard.trending': { en: 'Trending Niches', ar: 'المجالات الرائجة', fr: 'Niches tendance' },
  'dashboard.askZyra': { en: 'Ask Zyra', ar: 'اسأل زيرا', fr: 'Demander à Zyra' },
  'dashboard.analyzing': { en: 'Analyzing data for your store', ar: 'تحليل بيانات متجرك', fr: 'Analyse des données de votre boutique' },
  'dashboard.publishPrompt': { en: 'Publish your store so Zyra can analyze it', ar: 'انشر متجرك لتحليله بواسطة زيرا', fr: 'Publiez votre boutique pour que Zyra l\'analyse' },
  'dashboard.publishPromptBody': { en: 'Once your store is live, Zyra will pull in real sales, traffic and conversion data automatically.', ar: 'بمجرد نشر متجرك، ستجلب زيرا بيانات المبيعات والزيارات والتحويلات تلقائياً.', fr: 'Une fois votre boutique en ligne, Zyra récupérera automatiquement les ventes, le trafic et les conversions.' },
  'dashboard.publishNow': { en: 'Publish my store', ar: 'انشر متجري', fr: 'Publier ma boutique' },
  'dashboard.realData': { en: 'Showing live data from your published store.', ar: 'عرض بيانات حية من متجرك المنشور.', fr: 'Affichage des données en direct de votre boutique publiée.' },

  // Analytics
  'analytics.title': { en: 'Business Analytics', ar: 'تحليلات الأعمال', fr: 'Analytique commerciale' },
  'analytics.performance': { en: 'Sales Performance', ar: 'أداء المبيعات', fr: 'Performance des ventes' },
  'analytics.opportunities': { en: 'Market Opportunities', ar: 'فرص السوق', fr: 'Opportunités de marché' },
  'analytics.conversions': { en: 'Conversion Suggestions', ar: 'اقتراحات التحويل', fr: 'Suggestions de conversion' },
  'analytics.subtitle': { en: 'AI-generated insights and recommendations for your business', ar: 'رؤى وتوصيات مولدة بالذكاء الاصطناعي لعملك', fr: 'Insights et recommandations générés par IA' },

  // AI Chat
  'ai.title': { en: 'Zyra Assistant', ar: 'مساعد زيرا', fr: 'Assistant Zyra' },
  'ai.placeholder': { en: 'Ask Zyra anything…', ar: 'اسأل زيرا أي شيء…', fr: 'Demandez n\'importe quoi à Zyra…' },
  'ai.remaining': { en: 'messages remaining', ar: 'رسائل متبقية', fr: 'messages restants' },
  'ai.limit': { en: 'Message limit reached', ar: 'تم الوصول للحد الأقصى', fr: 'Limite atteinte' },
  'ai.upgrade': { en: 'Upgrade to continue', ar: 'قم بالترقية للمتابعة', fr: 'Mettez à niveau' },

  // Pricing
  'pricing.title': { en: 'Choose Your Plan', ar: 'اختر خطتك', fr: 'Choisissez votre forfait' },
  'pricing.current': { en: 'Current Plan', ar: 'الخطة الحالية', fr: 'Forfait actuel' },
  'pricing.upgrade': { en: 'Upgrade Now', ar: 'قم بالترقية الآن', fr: 'Mettre à niveau' },

  // Settings
  'settings.title': { en: 'Settings', ar: 'الإعدادات', fr: 'Paramètres' },
  'settings.language': { en: 'Language', ar: 'اللغة', fr: 'Langue' },
  'settings.theme': { en: 'Appearance', ar: 'المظهر', fr: 'Apparence' },
  'settings.account': { en: 'Account', ar: 'الحساب', fr: 'Compte' },
  'settings.subtitle': { en: 'Manage your account preferences and settings', ar: 'إدارة إعدادات حسابك وتفضيلاتك', fr: 'Gérez vos préférences et paramètres' },
  'settings.name': { en: 'Name', ar: 'الاسم', fr: 'Nom' },
  'settings.email': { en: 'Email', ar: 'البريد الإلكتروني', fr: 'Email' },
  'settings.currentPlan': { en: 'Current Plan', ar: 'الخطة الحالية', fr: 'Forfait actuel' },
  'settings.storeInfo': { en: 'Store Information', ar: 'معلومات المتجر', fr: 'Informations boutique' },
  'settings.storeUrl': { en: 'Store URL', ar: 'رابط المتجر', fr: 'URL boutique' },
  'settings.darkMode': { en: 'Dark Mode', ar: 'الوضع الداكن', fr: 'Mode sombre' },
  'settings.darkModeDesc': { en: 'Toggle between light and dark themes', ar: 'بدّل بين المظهر الفاتح والداكن', fr: 'Basculer clair/sombre' },
  'settings.displayLanguage': { en: 'Display Language', ar: 'لغة العرض', fr: 'Langue d\'affichage' },
  'settings.displayLanguageDesc': { en: 'Choose your preferred language', ar: 'اختر لغتك المفضلة', fr: 'Choisissez votre langue préférée' },
  'settings.notifications': { en: 'Notifications', ar: 'الإشعارات', fr: 'Notifications' },
  'settings.security': { en: 'Security', ar: 'الأمان', fr: 'Sécurité' },

  // Auth
  'auth.login': { en: 'Login', ar: 'تسجيل الدخول', fr: 'Connexion' },
  'auth.register': { en: 'Create Account', ar: 'إنشاء حساب', fr: 'Créer un compte' },

  // Common
  'common.loading': { en: 'Loading…', ar: 'جاري التحميل…', fr: 'Chargement…' },
  'common.send': { en: 'Send', ar: 'إرسال', fr: 'Envoyer' },
  'common.save': { en: 'Save', ar: 'حفظ', fr: 'Enregistrer' },
  'common.cancel': { en: 'Cancel', ar: 'إلغاء', fr: 'Annuler' },
  'common.publish': { en: 'Publish', ar: 'نشر', fr: 'Publier' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'salesbooster_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      const migrated = localStorage.getItem('lang_migrated_to_en_v1');
      if (!migrated) {
        localStorage.setItem(LANGUAGE_KEY, 'en');
        localStorage.setItem('lang_migrated_to_en_v1', '1');
        return 'en';
      }
      if (stored === 'en' || stored === 'ar' || stored === 'fr') return stored;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const t = (key: string): string => translations[key]?.[language] || translations[key]?.en || key;
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
