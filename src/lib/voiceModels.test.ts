import { describe, expect, it } from 'vitest';
import { voiceModelProfile } from '../../supabase/functions/_shared/voiceModels';
import { readVoiceStream } from './voiceStream';

describe('voice model profiles', () => {
  it('Zero uses the selected fast model and shortest reply budget', () => {
    expect(voiceModelProfile('openai/gpt-5.6-luna')).toMatchObject({ model: 'openai/gpt-5.6-luna', sentences: 2, effort: 'low' });
  });
  it('Ano is balanced and the default', () => {
    expect(voiceModelProfile(undefined)).toMatchObject({ model: 'openai/gpt-5.6-terra', sentences: 3, effort: 'low' });
  });
  it('Rot supports more detail without increasing reasoning effort', () => {
    expect(voiceModelProfile('openai/gpt-5.6-sol')).toMatchObject({ model: 'openai/gpt-5.6-sol', sentences: 6, effort: 'low' });
  });
  it('consumes fragmented metadata and text frames without stalling', async () => {
    const chunks = ['data: {"type":"response.created"}\n\n', 'data: {"type":"response.output_text.', 'delta","delta":"Hello."}\n\n', 'data: {"type":"response.completed"}\n\n'];
    const response = new Response(new ReadableStream({ start(controller) { chunks.forEach(c => controller.enqueue(new TextEncoder().encode(c))); controller.close(); } }));
    const received: string[] = [];
    expect(await readVoiceStream(response, delta => received.push(delta))).toBe('Hello.');
    expect(received).toEqual(['Hello.']);
  });
});