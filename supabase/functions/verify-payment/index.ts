import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { canPublish, tokenHash } from '../_shared/publishing.ts';

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

    const paid = session.payment_status === 'paid' && session.status === 'complete';
    let storeId: string | null = null;
    if (session.metadata?.kind === 'publish') {
      storeId = session.metadata.storeId;
      if (!storeId || typeof body.publishToken !== 'string') throw new Error('Use the browser where you started publishing to confirm this payment.');
      const db = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
      const { data: draft, error } = await db.from('store_publish_drafts').select('*').eq('id', storeId).eq('checkout_session_id', session.id).eq('token_hash', await tokenHash(body.publishToken)).maybeSingle();
      if (error || !draft) throw new Error('This checkout does not belong to your store.');
      if (!canPublish(session, storeId)) {
        return new Response(JSON.stringify({ paid: false, published: false, error: 'Payment is not successfully completed in live mode. Your store has not been published.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const { error: publishError } = await db.from('published_storefronts').upsert({ id: storeId, html: draft.html, store_name: draft.store_name, checkout_session_id: session.id }, { onConflict: 'id' });
      if (publishError) throw new Error('Payment confirmed, but publishing failed. Return to this page to retry publishing without paying again.');
    }

    return new Response(
      JSON.stringify({
        paid,
        status: session.status,
        kind: session.metadata?.kind ?? null,
        plan: session.metadata?.plan ?? null,
        domain: session.metadata?.domain ?? null,
        amountTotal: session.amount_total,
        published: Boolean(storeId),
        storeId,
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
