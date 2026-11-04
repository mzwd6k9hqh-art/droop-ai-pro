export const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' }, { code: 'ar', name: 'العربية' },
  { code: 'ar-DZ', name: 'الدارجة الجزائرية' },
  { code: 'ar-MA', name: 'الدارجة المغربية' },
  { code: 'ar-EG', name: 'العربية المصرية' },
  { code: 'fr', name: 'Français' }, { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' }, { code: 'pt', name: 'Português' },
  { code: 'it', name: 'Italiano' }, { code: 'tr', name: 'Türkçe' },
  { code: 'zh', name: '中文' }, { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' }, { code: 'hi', name: 'हिन्दी' },
  { code: 'ru', name: 'Русский' }, { code: 'id', name: 'Bahasa Indonesia' },
] as const;

export type Language = typeof LANGUAGE_OPTIONS[number]['code'];
export type LanguagePack = Record<string, string>;
export const LANGUAGE_KEY = 'salesbooster_language';
export const LANGUAGE_SELECTED_KEY = 'zyra_language_explicit';
export const isLanguage = (value: unknown): value is Language => LANGUAGE_OPTIONS.some(option => option.code === value);
export const isRtlLanguage = (language: string) => /^(ar|fa|he|ur)(-|$)/i.test(language);
export const languageName = (language: string) => LANGUAGE_OPTIONS.find(option => option.code === language)?.name || language;

let currentLanguage: Language = 'en';
let currentPack: LanguagePack = {};
let englishPack: LanguagePack = {};
const listeners = new Set<() => void>();
export const subscribeUiLanguage = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getUiLanguage = () => currentLanguage;
export function applyUiLanguage(language: Language, pack: LanguagePack, english: LanguagePack) {
  currentLanguage = language;
  currentPack = pack;
  englishPack = english;
  listeners.forEach(listener => listener());
}

export function translateUiText<T>(value: T): T {
  if (typeof value !== 'string' || !value.trim()) return value;
  const source = value.trim();
  if (source === 'ZYRA') return value;
  const normalized = source.replace(/زيرا/g, 'ZYRA');
  const translated = currentPack[source] ?? currentPack[normalized] ?? englishPack[source] ?? normalized;
  return value.replace(source, translated.replace(/زيرا/g, 'ZYRA')) as T;
}

export function selectedAssistantLanguage() {
  return localStorage.getItem(LANGUAGE_SELECTED_KEY) === 'true';
}