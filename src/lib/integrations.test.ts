// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { connectIntegration, triggerIntegration } from './integrations';

describe('AI service bridge', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
  it('does not report an unsuccessful API request as completed', async () => {
    connectIntegration('ai-service', 'https://bridge.example/ai');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    expect(await triggerIntegration('ai-service', { action: 'run_prompt' })).toBe(false);
  });
  it('requires a readable successful response', async () => {
    connectIntegration('ai-service', 'https://bridge.example/ai');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    expect(await triggerIntegration('ai-service', { action: 'run_prompt' })).toBe(true);
    expect(fetchMock.mock.calls[0][1].mode).toBe('cors');
  });
});