import { franc } from 'franc-min';
import { iso6393 } from 'iso-639-3';

export function initialSpeechLanguage(fallback: string, browserLanguage: string): string {
  if (browserLanguage.toLowerCase().startsWith(`${fallback.toLowerCase()}-`)) return browserLanguage;
  return { ar: 'ar-DZ', fr: 'fr-FR', en: 'en-US' }[fallback] || browserLanguage || fallback;
}

export function detectSpeechLanguage(text: string, fallback: string): string {
  if (/[\u0600-\u06ff]/u.test(text) && !/[\u067e\u0686\u0698\u06af\u06cc]/u.test(text)) {
    return fallback.startsWith('ar') ? fallback : 'ar';
  }
  const detected = franc(text, { minLength: 20 });
  if (detected === 'und') return fallback;
  return iso6393.find(language => language.iso6393 === detected)?.iso6391 || fallback;
}