export const PUBLISH_AMOUNT = 100;
export function canPublish(session: { payment_status?: string; status?: string | null; livemode?: boolean; currency?: string | null; amount_total?: number | null; metadata?: Record<string, string> | null }, storeId: string) {
  return session.payment_status === 'paid' && session.status === 'complete' && session.livemode === true
    && session.currency === 'usd' && session.amount_total === PUBLISH_AMOUNT
    && session.metadata?.kind === 'publish' && session.metadata?.storeId === storeId;
}
export async function tokenHash(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}