import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
    fr: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم', fr: 'Tableau de bord' },
  'nav.analytics': { en: 'Analytics', ar: 'التحليلات', fr: 'Analytique' },
  'nav.droopai': { en: 'DROOB AI', ar: 'دروب AI', fr: 'DROOB AI' },
  'nav.pricing': { en: 'Pricing', ar: 'الأسعار', fr: 'Tarification' },
  'nav.settings': { en: 'Settings', ar: 'الإعدادات', fr: 'Paramètres' },
  'nav.logout': { en: 'Logout', ar: 'تسجيل الخروج', fr: 'Déconnexion' },
  
  // Dashboard
  'dashboard.welcome': { en: 'Welcome back', ar: 'مرحباً بعودتك', fr: 'Bon retour' },
  'dashboard.insights': { en: 'AI-Powered Business Insights', ar: 'رؤى أعمال مدعومة بالذكاء الاصطناعي', fr: 'Insights commerciaux alimentés par l\'IA' },
  'dashboard.markets': { en: 'Top Global Markets', ar: 'أفضل الأسواق العالمية', fr: 'Meilleurs marchés mondiaux' },
  'dashboard.countries': { en: 'Best Countries to Start', ar: 'أفضل الدول للبدء', fr: 'Meilleurs pays pour commencer' },
  'dashboard.trending': { en: 'Trending Niches', ar: 'المجالات الرائجة', fr: 'Niches tendance' },
  
  // Analytics
  'analytics.title': { en: 'Business Analytics', ar: 'تحليلات الأعمال', fr: 'Analytique commerciale' },
  'analytics.performance': { en: 'Sales Performance', ar: 'أداء المبيعات', fr: 'Performance des ventes' },
  'analytics.opportunities': { en: 'Market Opportunities', ar: 'فرص السوق', fr: 'Opportunités de marché' },
  'analytics.conversions': { en: 'Conversion Suggestions', ar: 'اقتراحات التحويل', fr: 'Suggestions de conversion' },
  
  // AI Chat
  'ai.title': { en: 'DROOB AI Assistant', ar: 'مساعد دروب AI', fr: 'Assistant DROOB AI' },
  'ai.placeholder': { en: 'Ask DROOB AI about business strategies...', ar: 'اسأل دروب AI عن استراتيجيات العمل...', fr: 'Demandez à DROOB AI des stratégies commerciales...' },
  'ai.remaining': { en: 'messages remaining', ar: 'رسائل متبقية', fr: 'messages restants' },
  'ai.limit': { en: 'Message limit reached', ar: 'تم الوصول للحد الأقصى', fr: 'Limite de messages atteinte' },
  'ai.upgrade': { en: 'Upgrade to continue chatting', ar: 'قم بالترقية للمتابعة', fr: 'Mettez à niveau pour continuer' },
  
  // Pricing
  'pricing.title': { en: 'Choose Your Plan', ar: 'اختر خطتك', fr: 'Choisissez votre forfait' },
  'pricing.current': { en: 'Current Plan', ar: 'الخطة الحالية', fr: 'Forfait actuel' },
  'pricing.upgrade': { en: 'Upgrade Now', ar: 'قم بالترقية الآن', fr: 'Mettre à niveau maintenant' },
  
  // Settings
  'settings.title': { en: 'Settings', ar: 'الإعدادات', fr: 'Paramètres' },
  'settings.language': { en: 'Language', ar: 'اللغة', fr: 'Langue' },
  'settings.theme': { en: 'Theme', ar: 'المظهر', fr: 'Thème' },
  'settings.account': { en: 'Account', ar: 'الحساب', fr: 'Compte' },
  
  // Auth
  'auth.login': { en: 'Login', ar: 'تسجيل الدخول', fr: 'Connexion' },
  'auth.register': { en: 'Create Account', ar: 'إنشاء حساب', fr: 'Créer un compte' },
  'auth.email': { en: 'Email', ar: 'البريد الإلكتروني', fr: 'Email' },
  'auth.password': { en: 'Password', ar: 'كلمة المرور', fr: 'Mot de passe' },
  'auth.name': { en: 'Full Name', ar: 'الاسم الكامل', fr: 'Nom complet' },
  
  // Common
  'common.loading': { en: 'Loading...', ar: 'جاري التحميل...', fr: 'Chargement...' },
  'common.send': { en: 'Send', ar: 'إرسال', fr: 'Envoyer' },
  'common.save': { en: 'Save', ar: 'حفظ', fr: 'Enregistrer' },
  'common.cancel': { en: 'Cancel', ar: 'إلغاء', fr: 'Annuler' },
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
    // Force English as default for all users
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      // Migration: legacy users on AR/FR get switched to EN once
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

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
