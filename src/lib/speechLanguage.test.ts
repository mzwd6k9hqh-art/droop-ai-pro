import { describe, expect, it } from 'vitest';
import { detectSpeechLanguage, initialSpeechLanguage } from './speechLanguage';

describe('multilingual speech', () => {
  it('keeps Algerian Arabic recognition locale', async () => {
    expect(initialSpeechLanguage('ar', 'ar-DZ')).toBe('ar-DZ');
    expect(await detectSpeechLanguage('واش راك اليوم؟ نحب نهدر معاك على الخدمة', 'ar-DZ')).toBe('ar-DZ');
  });
  it('selects Arabic speech for Arabic instead of English', async () => {
    expect(await detectSpeechLanguage('إزيك يا صاحبي عامل إيه النهارده؟', 'en-US')).toBe('ar');
  });
  it('detects Spanish even when interface language is English', async () => {
    expect(await detectSpeechLanguage('Hola, necesito ayuda para organizar mi trabajo y preparar una reunión mañana.', 'en-US')).toBe('es');
  });
  it('does not guess a language from an ambiguous short utterance', async () => {
    expect(await detectSpeechLanguage('OK', 'fr-FR')).toBe('fr-FR');
  });
});