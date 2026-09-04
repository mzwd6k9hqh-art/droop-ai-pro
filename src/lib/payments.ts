import { supabase } from '@/integrations/supabase/client';

export type CheckoutRequest =
  | { kind: 'plan'; plan: 'starter' | 'pro' | 'premium' }
  | { kind: 'domain'; domain: string };

/**
 * Creates a real Stripe Checkout session and redirects the browser to it.
 * Throws on failure so callers can show an error.
 */
export async function startCheckout(req: CheckoutRequest): Promise<void> {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { ...req, origin: window.location.origin },
  });

  if (error) throw new Error(error.message || 'Could not start checkout');
  if (!data?.url) throw new Error(data?.error || 'Could not start checkout');

  window.location.href = data.url as string;
}

export interface VerifiedPayment {
  paid: boolean;
  status: string | null;
  kind: 'plan' | 'domain' | null;
  plan: string | null;
  domain: string | null;
  amountTotal: number | null;
}

export async function verifyPayment(sessionId: string): Promise<VerifiedPayment> {
  const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: { sessionId },
  });
  if (error) throw new Error(error.message || 'Could not verify payment');
  if (data?.error) throw new Error(data.error);
  return data as VerifiedPayment;
}
