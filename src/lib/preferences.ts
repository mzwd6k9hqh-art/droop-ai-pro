// User preferences for ZYRA — persisted locally.

export type AiTone = 'friendly' | 'professional' | 'concise' | 'playful';
export type AiLength = 'short' | 'balanced' | 'detailed';
export type AiExpertise = 'general' | 'ecommerce' | 'coding' | 'writing' | 'research';
export type AiLanguageStyle = 'simple' | 'natural' | 'technical' | 'creative';

export interface Preferences {
  // Notifications
  notifyProductUpdates: boolean;
  notifyReminders: boolean;
  notifySound: boolean;
  notifyEmail: boolean;
  // Chat history
  saveHistory: boolean;
  historyLimit: number; // conversations kept
  // AI behavior
  aiTone: AiTone;
  aiLength: AiLength;
  aiExpertise: AiExpertise;
  aiEmojis: boolean;
  aiProactive: boolean;
  aiCustomInstructions: string;
  aiNickname: string;
  // Privacy
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  allowWebSearch: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  notifyProductUpdates: true,
  notifyReminders: true,
  notifySound: false,
  notifyEmail: false,
  saveHistory: true,
  historyLimit: 50,
  aiTone: 'friendly',
  aiLength: 'balanced',
  aiExpertise: 'general',
  aiEmojis: true,
  aiProactive: true,
  aiCustomInstructions: '',
  aiNickname: '',
  allowAnalytics: true,
  allowPersonalization: true,
  allowWebSearch: true,
};

const KEY = 'zyra_preferences';

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: Preferences) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent('zyra-preferences-changed', { detail: prefs }));
}

export function clearChatHistory() {
  const keys = Object.keys(localStorage).filter(
    (k) => k.includes('conversations') || k.includes('chat_history')
  );
  keys.forEach((k) => localStorage.removeItem(k));
}
