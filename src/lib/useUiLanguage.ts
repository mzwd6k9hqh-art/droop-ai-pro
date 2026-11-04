import { useSyncExternalStore } from 'react';
import { getUiLanguage, subscribeUiLanguage } from './uiLanguage';

export function useUiLanguageVersion() {
  return useSyncExternalStore(subscribeUiLanguage, getUiLanguage, () => 'en');
}