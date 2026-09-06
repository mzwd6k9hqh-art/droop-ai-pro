// App appearance customization — colors, fonts, chat bubbles, ZYRA avatar.

export type BubbleStyle = 'flat' | 'rounded' | 'bubbles' | 'outlined';
export type AvatarStyle = 'mark' | 'sparkle' | 'orb' | 'initial';
export type FontChoice = 'default' | 'inter' | 'poppins' | 'serif' | 'mono' | 'rounded';

export interface Appearance {
  accent: string; // hex
  font: FontChoice;
  bubbleStyle: BubbleStyle;
  avatar: AvatarStyle;
  avatarColor: string; // hex
}

export const ACCENT_PRESETS: { name: string; value: string }[] = [
  { name: 'Violet', value: '#7C3AED' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Slate', value: '#475569' },
];

export const FONT_STACKS: Record<FontChoice, string> = {
  default: '',
  inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
  poppins: "'Poppins', ui-sans-serif, system-ui, sans-serif",
  serif: "ui-serif, Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  rounded: "'Nunito', ui-rounded, 'Segoe UI', system-ui, sans-serif",
};

export const FONT_LABELS: Record<FontChoice, string> = {
  default: 'App default',
  inter: 'Inter (clean)',
  poppins: 'Poppins (modern)',
  serif: 'Serif (editorial)',
  mono: 'Mono (technical)',
  rounded: 'Rounded (friendly)',
};

export const DEFAULT_APPEARANCE: Appearance = {
  accent: '#7C3AED',
  font: 'default',
  bubbleStyle: 'rounded',
  avatar: 'mark',
  avatarColor: '#7C3AED',
};

const KEY = 'zyra_appearance';

export function loadAppearance(): Appearance {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_APPEARANCE };
    return { ...DEFAULT_APPEARANCE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

export function saveAppearance(a: Appearance) {
  localStorage.setItem(KEY, JSON.stringify(a));
  applyAppearance(a);
  window.dispatchEvent(new CustomEvent('zyra-appearance-changed', { detail: a }));
}

function hexToHsl(hex: string): string | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const dd = max - min;
  const s = dd === 0 ? 0 : dd / (1 - Math.abs(2 * l - 1));
  if (dd !== 0) {
    if (max === r) h = ((g - b) / dd) % 6;
    else if (max === g) h = (b - r) / dd + 2;
    else h = (r - g) / dd + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyAppearance(a: Appearance = loadAppearance()) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const hsl = hexToHsl(a.accent);
  if (hsl) {
    root.style.setProperty('--primary', hsl);
    root.style.setProperty('--ring', hsl);
    root.style.setProperty('--sidebar-primary', hsl);
  }
  const stack = FONT_STACKS[a.font];
  if (stack) root.style.setProperty('--app-font', stack);
  else root.style.removeProperty('--app-font');
  document.body.style.fontFamily = stack || '';
  root.dataset.bubbleStyle = a.bubbleStyle;
}
