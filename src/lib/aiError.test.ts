import { describe, expect, it } from 'vitest';
import { aiErrorMessage } from './aiError';
import { gatewayError } from '../../supabase/functions/_shared/gatewayError';

describe('AI service failures', () => {
  it('preserves the 402 status and upstream credit remedy', () => {
    expect(gatewayError(402, { message: 'Add credits to continue.', props: { retryable: false, requires: 'top_up' } }))
      .toEqual({ status: 402, message: 'Add credits to continue.', props: { retryable: false, requires: 'top_up' } });
  });
  it('preserves a provider denial rather than converting it to 500', () => {
    expect(gatewayError(403, { error: { message: 'Access denied.' } }))
      .toEqual({ status: 403, message: 'Access denied.' });
  });
  it('reads the safe message from an edge function response instead of its generic exception', async () => {
    const context = new Response(JSON.stringify({ error: 'يرجى إضافة رصيد للمتابعة.' }), { status: 402 });
    expect(await aiErrorMessage({ context, message: 'Edge Function returned a non-2xx status code' }))
      .toBe('يرجى إضافة رصيد للمتابعة.');
  });
});