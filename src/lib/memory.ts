// ZYRA persistent memory — kept on this device.

export type MemoryKind = 'profile' | 'store' | 'preference' | 'goal' | 'fact';

export interface MemoryItem {
  id: string;
  kind: MemoryKind;
  text: string;
  createdAt: number;
}

const KEY = 'zyra_memory';
const MAX_ITEMS = 200;

export const MEMORY_KIND_LABELS: Record<MemoryKind, string> = {
  profile: 'About you',
  store: 'Your store',
  preference: 'Preferences',
  goal: 'Goals',
  fact: 'Other',
};

export function loadMemory(): MemoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items: MemoryItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(-MAX_ITEMS)));
  window.dispatchEvent(new CustomEvent('zyra-memory-changed'));
}

export function addMemory(text: string, kind: MemoryKind = 'fact'): MemoryItem | null {
  const clean = (text || '').trim();
  if (!clean) return null;
  const items = loadMemory();
  // Avoid near-duplicates
  if (items.some((i) => i.text.trim().toLowerCase() === clean.toLowerCase())) return null;
  const item: MemoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    text: clean,
    createdAt: Date.now(),
  };
  persist([...items, item]);
  return item;
}

export function removeMemory(id: string) {
  persist(loadMemory().filter((i) => i.id !== id));
}

export function clearMemory() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('zyra-memory-changed'));
}

/** Compact text block sent to the model so ZYRA remembers across sessions. */
export function memoryForPrompt(): string[] {
  return loadMemory()
    .slice(-60)
    .map((i) => `[${i.kind}] ${i.text}`);
}
