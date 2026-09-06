// Selectable AI models for ZYRA (served through Lovable AI).

export interface AiModelOption {
  id: string;
  name: string;
  vendor: string;
  description: string;
  badge?: string;
}

export const AI_MODELS: AiModelOption[] = [
  {
    id: 'google/gemini-3.7-flash',
    name: 'ZYRA Flash (Gemini 3.7)',
    vendor: 'Google',
    description: 'Fast and smart. Best everyday choice.',
    badge: 'Recommended',
  },
  {
    id: 'google/gemini-3.1-pro-preview',
    name: 'ZYRA Pro (Gemini 3.1 Pro)',
    vendor: 'Google',
    description: 'Deeper reasoning for complex strategy and analysis.',
  },
  {
    id: 'google/gemini-3.1-flash-lite',
    name: 'ZYRA Lite (Gemini 3.1 Lite)',
    vendor: 'Google',
    description: 'Lightning quick for simple questions.',
  },
  {
    id: 'openai/gpt-5.5',
    name: 'GPT-5.5',
    vendor: 'OpenAI',
    description: 'Excellent writing, coding and instruction following.',
  },
  {
    id: 'openai/gpt-5.6-terra',
    name: 'GPT-5.6 Terra',
    vendor: 'OpenAI',
    description: 'Balanced GPT-5.6 for everyday work.',
  },
  {
    id: 'openai/gpt-5.4-mini',
    name: 'GPT-5.4 Mini',
    vendor: 'OpenAI',
    description: 'Quick and affordable for high-volume chats.',
  },
];

export const DEFAULT_MODEL = AI_MODELS[0].id;

export function getModel(id?: string): AiModelOption {
  return AI_MODELS.find((m) => m.id === id) || AI_MODELS[0];
}
