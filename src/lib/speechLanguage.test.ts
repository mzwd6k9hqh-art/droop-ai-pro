import { describe, expect, it } from 'vitest';
import { detectSpeechLanguage, initialSpeechLanguage } from './speechLanguage';
import { languageDirective } from '../../supabase/functions/_shared/language';

describe('multilingual speech', () => {
  it('keeps Algerian Arabic recognition locale', () => {
    expect(initialSpeechLanguage('ar', 'ar-DZ')).toBe('ar-DZ');
    expect(detectSpeechLanguage('واش راك اليوم؟ نحب نهدر معاك على الخدمة', 'ar-DZ')).toBe('ar-DZ');
  });
  it('selects Arabic speech for Arabic instead of English', () => {
    expect(detectSpeechLanguage('إزيك يا صاحبي عامل إيه النهارده؟', 'en-US')).toBe('ar');
  });
  it('detects Spanish even when interface language is English', () => {
    expect(detectSpeechLanguage('Hola, necesito ayuda para organizar mi trabajo y preparar una reunión mañana.', 'en-US')).toBe('es');
  });
  it('does not guess a language from an ambiguous short utterance', () => {
    expect(detectSpeechLanguage('OK', 'fr-FR')).toBe('fr-FR');
  });
});