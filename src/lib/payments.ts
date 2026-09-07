import { supabase } from '@/integrations/supabase/client';

export type CheckoutRequest =
  | { kind: 'plan'; plan: 'starter' | 'pro' | 'premium' }
  | { kind: 'domain'; domain: string };

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(
      () => reject(new Error('Payment service timed out. Please check your connection and try again.')),
      ms,
    );
    p.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      },
    );
  });
}

/**
 * Creates a real Stripe Checkout session and sends the browser to it.
 *
 * The app can run inside an embedded frame (preview / installed PWA) where a
 * top-level redirect is blocked, which previously left the button stuck on
 * "Redirecting…". We therefore open a tab up front (synchronously, so it is not
 * treated as a popup) and point it at the Stripe URL. If the tab was blocked we
 * fall back to a normal redirect of the top-most window we are allowed to touch.
 *
 * Returns the checkout URL so callers can offer a manual link.
 * Throws on failure so callers can show a clear error state.
 */
export async function startCheckout(req: CheckoutRequest): Promise<string> {
  let tab: Window | null = null;
  try {
    tab = window.open('', '_blank', 'noopener,noreferrer');
  } catch {
    tab = null;
  }

  try {
    const { data, error } = await withTimeout(
      supabase.functions.invoke('create-checkout', {
        body: { ...req, origin: window.location.origin },
      }),
      25000,
    );

    if (error) throw new Error(error.message || 'Could not start checkout');
    const url = data?.url as string | undefined;
    if (!url) throw new Error(data?.error || 'Could not start checkout');

    if (tab && !tab.closed) {
      tab.location.href = url;
    } else {
      try {
        // Escape an embedding frame when allowed, otherwise navigate ourselves.
        (window.top ?? window).location.href = url;
      } catch {
        window.location.href = url;
      }
    }

    return url;
  } catch (e) {
    if (tab && !tab.closed) tab.close();
    throw e instanceof Error ? e : new Error('Could not start checkout');
  }
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
