import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { PUBLISH_AMOUNT, tokenHash } from '../_shared/publishing.ts';

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

    if (kind !== 'domain' && kind !== 'plan' && kind !== 'publish') {
      return new Response(JSON.stringify({ error: 'Invalid checkout kind' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' });

    let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;
    let mode: 'payment' | 'subscription' = 'payment';
    const metadata: Record<string, string> = { kind };

    let draftId: string | null = null;
    const db = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    if (kind === 'publish') {
      if (!key.startsWith('sk_live_') && !key.startsWith('rk_live_')) {
        return new Response(JSON.stringify({ error: 'Store publishing requires live Stripe payments. Payments are currently in test mode; your store has not been published.' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (typeof body.html !== 'string' || body.html.length < 50 || body.html.length > 2000000 || typeof body.publishToken !== 'string' || !/^[0-9a-f-]{36}$/.test(body.publishToken)) {
        return new Response(JSON.stringify({ error: 'Invalid store publishing request' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const { data: draft, error } = await db.from('store_publish_drafts').insert({ html: body.html, token_hash: await tokenHash(body.publishToken), store_name: String(body.storeName || 'Store').slice(0, 200) }).select('id').single();
      if (error || !draft) throw new Error('Could not save the store for publishing');
      draftId = draft.id;
      metadata.storeId = draft.id;
      lineItem = { quantity: 1, price_data: { currency: 'usd', unit_amount: PUBLISH_AMOUNT, product_data: { name: 'ZYRA store publishing — one-time' } } };
    } else if (kind === 'domain') {
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
      cancel_url: `${origin}/payment-canceled?kind=${kind}`,
    });

    if (draftId) {
      const { error } = await db.from('store_publish_drafts').update({ checkout_session_id: session.id }).eq('id', draftId);
      if (error) { await stripe.checkout.sessions.expire(session.id); throw new Error('Could not prepare store publishing'); }
    }

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
