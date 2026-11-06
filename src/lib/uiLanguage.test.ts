import { describe, it, expect, beforeEach } from 'vitest';
import { applyUiLanguage, getUiLanguage, isRtlLanguage, selectedAssistantLanguage, translateUiText, LANGUAGE_SELECTED_KEY } from './uiLanguage';
import { languageDirective } from '../../supabase/functions/_shared/language';
import { initialSpeechLanguage } from './speechLanguage';

describe('language selection rules', () => {
  beforeEach(() => localStorage.clear());
  it('keeps ZYRA unchanged across selected languages', () => {
    applyUiLanguage('ar-DZ', { ZYRA: 'زيرا' }, {});
    expect(translateUiText('ZYRA')).toBe('ZYRA');
  });
  it('updates the shared active language immediately', () => {
    applyUiLanguage('fr', {}, {});
    expect(getUiLanguage()).toBe('fr');
    applyUiLanguage('ar-MA', {}, {});
    expect(getUiLanguage()).toBe('ar-MA');
  });
  it('uses right-to-left layout for Algerian, Moroccan and Egyptian Arabic', () => {
    expect(['ar-DZ', 'ar-MA', 'ar-EG'].map(isRtlLanguage)).toEqual([true, true, true]);
    expect(isRtlLanguage('fr')).toBe(false);
  });
  it('records explicit selection for subsequent assistant requests', () => {
    expect(selectedAssistantLanguage()).toBe(false);
    localStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
    expect(selectedAssistantLanguage()).toBe(true);
  });
  it('instructs new replies to follow the selected dialect, not previous conversation language', () => {
    for (const [code, name] of [['ar-DZ', 'Algerian Darija'], ['ar-MA', 'Moroccan Darija'], ['ar-EG', 'Egyptian Arabic']]) {
      const policy = languageDirective(code, true);
      expect(policy).toContain(name);
      expect(policy).toContain('even when the latest message or previous conversation uses another language');
    }
  });
  it('keeps each selected Arabic recognition locale', () => {
    expect(initialSpeechLanguage('ar-DZ', 'en-US')).toBe('ar-DZ');
    expect(initialSpeechLanguage('ar-MA', 'en-US')).toBe('ar-MA');
    expect(initialSpeechLanguage('ar-EG', 'en-US')).toBe('ar-EG');
  });
});