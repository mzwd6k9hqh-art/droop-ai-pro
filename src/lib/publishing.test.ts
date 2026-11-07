import { describe, it, expect } from 'vitest';
import { canPublish, PUBLISH_AMOUNT } from '../../supabase/functions/_shared/publishing';
const paid = { payment_status: 'paid', status: 'complete', livemode: true, currency: 'usd', amount_total: 100, metadata: { kind: 'publish', storeId: 'store-1' } };
describe('payment-gated publishing', () => {
  it('charges exactly $1 USD', () => expect(PUBLISH_AMOUNT).toBe(100));
  it('permits only completed paid publishing sessions for the matching store', () => expect(canPublish(paid, 'store-1')).toBe(true));
  it('rejects completed but unpaid sessions', () => expect(canPublish({ ...paid, payment_status: 'unpaid' }, 'store-1')).toBe(false));
  it('rejects incomplete checkout', () => expect(canPublish({ ...paid, status: 'open' }, 'store-1')).toBe(false));
  it('rejects test payments for live activation', () => expect(canPublish({ ...paid, livemode: false }, 'store-1')).toBe(false));
  it('rejects unrelated payments', () => expect(canPublish({ ...paid, metadata: { kind: 'domain', storeId: 'store-1' } }, 'store-1')).toBe(false));
  it('rejects another store', () => expect(canPublish(paid, 'store-2')).toBe(false));
  it('rejects an incorrect amount', () => expect(canPublish({ ...paid, amount_total: 1 }, 'store-1')).toBe(false));
});