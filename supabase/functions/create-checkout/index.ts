import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import Stripe from 'npm:stripe@17';

const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  starter: { amount: 1900, name: 'ZYRA Starter Plan' },
  pro: { amount: 4900, name: 'ZYRA Pro Plan' },
  premium: { amount: 9900, name: 'ZYRA Premium Plan' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const key = Deno.env.get('STRIPE_SECRET_KEY');
    if (!key) {
      return new Response(JSON.stringify({ error: 'Stripe is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const kind = body?.kind;
    const origin = typeof body?.origin === 'string' && body.origin.startsWith('http')
      ? body.origin
      : req.headers.get('origin') || '';

    if (kind !== 'domain' && kind !== 'plan') {
      return new Response(JSON.stringify({ error: 'Invalid checkout kind' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' });

    let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;
    let mode: 'payment' | 'subscription' = 'payment';
    const metadata: Record<string, string> = { kind };

    if (kind === 'domain') {
      const domain = String(body?.domain || '').trim().toLowerCase();
      if (!/^[a-z0-9-]{1,63}\.[a-z]{2,10}$/.test(domain)) {
        return new Response(JSON.stringify({ error: 'Invalid domain name' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      metadata.domain = domain;
      lineItem = {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: 100,
          product_data: { name: `Domain ${domain} — first year` },
        },
      };
    } else {
      const plan = String(body?.plan || '');
      const cfg = PLAN_PRICES[plan];
      if (!cfg) {
        return new Response(JSON.stringify({ error: 'Invalid plan' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      metadata.plan = plan;
      mode = 'subscription';
      lineItem = {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: cfg.amount,
          recurring: { interval: 'month' },
          product_data: { name: cfg.name },
        },
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [lineItem],
      metadata,
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-canceled`,
    });

    return new Response(JSON.stringify({ url: session.url, id: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('create-checkout error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
