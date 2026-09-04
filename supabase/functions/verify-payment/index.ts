import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import Stripe from 'npm:stripe@17';

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
    const sessionId = String(body?.sessionId || '');
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
      return new Response(JSON.stringify({ error: 'Invalid session id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.payment_status === 'paid' || session.status === 'complete';

    return new Response(
      JSON.stringify({
        paid,
        status: session.status,
        kind: session.metadata?.kind ?? null,
        plan: session.metadata?.plan ?? null,
        domain: session.metadata?.domain ?? null,
        amountTotal: session.amount_total,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('verify-payment error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
