// Selectable ZYRA models (served through Lovable AI).

export interface AiModelOption {
  id: string;
  name: string;
  vendor: string;
  description: string;
  badge?: string;
  pro?: boolean;
}

export const AI_MODELS: AiModelOption[] = [
  {
    id: 'openai/gpt-5.6-luna',
    name: 'Zero 1.6',
    vendor: 'ZYRA',
    description: 'Light, fast and simple tasks. Short, quick answers.',
    badge: 'Free',
  },
  {
    id: 'openai/gpt-5.6-terra',
    name: 'Ano 2.2',
    vendor: 'ZYRA',
    description: 'The standard model — best for everyday tasks.',
    badge: 'Default',
  },
  {
    id: 'openai/gpt-5.6-sol',
    name: 'Rot 1.0',
    vendor: 'ZYRA',
    description: 'Smartest and most powerful — coding, deep analysis, hard problems.',
    badge: 'Pro',
    pro: true,
  },
];

export const DEFAULT_MODEL = AI_MODELS[1].id;

export function getModel(id?: string): AiModelOption {
  return AI_MODELS.find((m) => m.id === id) || AI_MODELS[1];
}

/** Resolves the model actually allowed for this user's plan. */
export function resolveModel(id: string | undefined, isPaid: boolean): AiModelOption {
  const m = getModel(id);
  return m.pro && !isPaid ? AI_MODELS[1] : m;
}
