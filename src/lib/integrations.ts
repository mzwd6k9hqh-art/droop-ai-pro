// External services & smart-device connections for ZYRA.

export type IntegrationCategory = 'calendar' | 'smart-home' | 'productivity' | 'messaging' | 'custom';

export interface IntegrationDef {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  emoji: string;
  /** What ZYRA can do once it's connected. */
  abilities: string[];
  /** Label of the credential the user pastes (webhook URL or API token). */
  fieldLabel: string;
  fieldPlaceholder: string;
}

export const INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'google-calendar',
    name: 'Calendar',
    category: 'calendar',
    description: 'Let ZYRA read your schedule and create events.',
    emoji: '📅',
    abilities: ['Create events', 'Check availability', 'Daily agenda'],
    fieldLabel: 'Calendar webhook / API URL',
    fieldPlaceholder: 'https://…',
  },
  {
    id: 'reminders',
    name: 'Reminders & Tasks',
    category: 'productivity',
    description: 'ZYRA can create reminders and to-dos for you.',
    emoji: '⏰',
    abilities: ['Create reminders', 'List tasks', 'Mark done'],
    fieldLabel: 'Tasks webhook URL (optional)',
    fieldPlaceholder: 'https://…',
  },
  {
    id: 'smart-home',
    name: 'Smart Home',
    category: 'smart-home',
    description: 'Control lights, plugs and scenes through a webhook (Home Assistant, IFTTT, SmartThings).',
    emoji: '💡',
    abilities: ['Turn devices on/off', 'Run scenes', 'Read sensor state'],
    fieldLabel: 'Home Assistant / IFTTT webhook URL',
    fieldPlaceholder: 'https://homeassistant.local/api/webhook/…',
  },
  {
    id: 'notion',
    name: 'Notes',
    category: 'productivity',
    description: 'Save summaries, research and drafts to your notes app.',
    emoji: '📝',
    abilities: ['Save notes', 'Append research', 'Store drafts'],
    fieldLabel: 'Notes webhook URL',
    fieldPlaceholder: 'https://…',
  },
  {
    id: 'slack',
    name: 'Team Chat',
    category: 'messaging',
    description: 'Send updates and alerts to your team channel.',
    emoji: '💬',
    abilities: ['Send messages', 'Post daily summary'],
    fieldLabel: 'Incoming webhook URL',
    fieldPlaceholder: 'https://hooks.slack.com/services/…',
  },
  {
    id: 'custom',
    name: 'Custom API / Device',
    category: 'custom',
    description: 'Connect any device or service that accepts an HTTP webhook.',
    emoji: '🔌',
    abilities: ['Trigger any endpoint', 'Send custom payloads'],
    fieldLabel: 'Endpoint URL',
    fieldPlaceholder: 'https://…',
  },
];

export interface ConnectedIntegration {
  id: string;
  endpoint: string;
  connectedAt: string;
}

const KEY = 'zyra_integrations';

export function loadIntegrations(): ConnectedIntegration[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveIntegrations(list: ConnectedIntegration[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('zyra-integrations-changed', { detail: list }));
}

export function connectIntegration(id: string, endpoint: string) {
  const list = loadIntegrations().filter((i) => i.id !== id);
  list.push({ id, endpoint, connectedAt: new Date().toISOString() });
  saveIntegrations(list);
}

export function disconnectIntegration(id: string) {
  saveIntegrations(loadIntegrations().filter((i) => i.id !== id));
}

/** Fire a webhook for a connected integration. Returns true when the call succeeded. */
export async function triggerIntegration(id: string, payload: Record<string, unknown>) {
  const conn = loadIntegrations().find((i) => i.id === id);
  if (!conn?.endpoint) return false;
  try {
    await fetch(conn.endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'ZYRA', at: new Date().toISOString(), ...payload }),
    });
    return true;
  } catch {
    return false;
  }
}

// ---------- Reminders ----------
export interface Reminder {
  id: string;
  text: string;
  dueAt?: string;
  done: boolean;
  createdAt: string;
}

const REM_KEY = 'zyra_reminders';

export function loadReminders(): Reminder[] {
  try {
    return JSON.parse(localStorage.getItem(REM_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveReminders(list: Reminder[]) {
  localStorage.setItem(REM_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('zyra-reminders-changed', { detail: list }));
}

export function addReminder(text: string, dueAt?: string): Reminder {
  const reminder: Reminder = {
    id: crypto.randomUUID(),
    text,
    dueAt,
    done: false,
    createdAt: new Date().toISOString(),
  };
  saveReminders([reminder, ...loadReminders()]);
  triggerIntegration('reminders', { type: 'reminder', text, dueAt });
  return reminder;
}
