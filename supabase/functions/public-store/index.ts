import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const headers = { ...corsHeaders, 'Content-Type': 'application/json' };
  try {
    const { storeId } = await req.json();
    if (typeof storeId !== 'string' || !/^[0-9a-f-]{36}$/.test(storeId)) return new Response(JSON.stringify({ error: 'Invalid store' }), { status: 400, headers });
    const db = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_ANON_KEY') || '');
    const { data, error } = await db.from('published_storefronts').select('html,store_name').eq('id', storeId).maybeSingle();
    if (error || !data) return new Response(JSON.stringify({ error: 'Store unavailable' }), { status: 404, headers });
    return new Response(JSON.stringify(data), { headers });
  } catch { return new Response(JSON.stringify({ error: 'Store unavailable' }), { status: 400, headers }); }
});