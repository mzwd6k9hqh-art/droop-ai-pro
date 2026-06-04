// API Gateway - scaffolding for routing requests to external microservices
// Authenticated proxy that can be extended to call external APIs safely.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface RouteConfig {
  baseUrl?: string;
  // Add secret name in Deno.env to attach as bearer if needed
  authSecretEnv?: string;
  allowedMethods?: string[];
}

// Registry of supported external services. Extend here as integrations are added.
const ROUTES: Record<string, RouteConfig> = {
  // example:
  // shopify: { baseUrl: 'https://api.shopify.com', authSecretEnv: 'SHOPIFY_TOKEN' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const userId = claimsData.claims.sub;

    const body = await req.json().catch(() => ({}));
    const { service, path = '/', method = 'GET', headers = {}, payload } = body ?? {};

    if (!service || typeof service !== 'string') {
      return json({ error: 'Missing "service"' }, 400);
    }

    const route = ROUTES[service];
    if (!route?.baseUrl) {
      // Scaffolding response — no external service wired yet.
      return json({
        ok: true,
        message: `Service "${service}" is not yet configured. Register it in ROUTES.`,
        userId,
        echo: { service, path, method, payload: payload ?? null },
      }, 200);
    }

    if (route.allowedMethods && !route.allowedMethods.includes(method)) {
      return json({ error: `Method ${method} not allowed for ${service}` }, 405);
    }

    const outHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (route.authSecretEnv) {
      const token = Deno.env.get(route.authSecretEnv);
      if (token) outHeaders['Authorization'] = `Bearer ${token}`;
    }

    const url = `${route.baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
    const upstream = await fetch(url, {
      method,
      headers: outHeaders,
      body: method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify(payload ?? {}),
    });

    const text = await upstream.text();
    let data: unknown = text;
    try { data = JSON.parse(text); } catch { /* keep as text */ }

    return json({ status: upstream.status, data }, 200);
  } catch (err) {
    console.error('api-gateway error', err);
    return json({ error: (err as Error).message ?? 'Internal error' }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
