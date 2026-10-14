// Voice chat edge function — turns user transcripts into spoken AI replies
// (text-only via Lovable AI Gateway; the browser handles TTS/STT).
import { languageDirective } from '../_shared/language.ts';
import { BUILDER_IDENTITY, builderReply } from '../_shared/identity.ts';
import { voiceModelProfile } from '../_shared/voiceModels.ts';
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, getLovableAiGatewayResponseHeaders } from '../_shared/gatewayRunId.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface VoiceMessage {
  role: 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, storeContext, language, model } = await req.json();
    const profile = voiceModelProfile(model);
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages must be an array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const identityReply = builderReply(messages);
    if (identityReply) {
      return new Response(JSON.stringify({ reply: identityReply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');

    const systemPrompt = `You are ZYRA, a friendly general-purpose voice assistant who also helps with e-commerce.
Speak naturally — warm, conversational sentences, no markdown or bullet lists.
${profile.direction}
You're on a live voice call, so avoid lists, code, or emoji. Be encouraging and proactive.
${languageDirective(typeof language === 'string' ? language : 'en')}
${storeContext ? `Store context: ${JSON.stringify(storeContext).slice(0, 500)}` : ''}
${BUILDER_IDENTITY}`;

    const gateway = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
    const aiResp = await gateway.fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST',
      signal: req.signal,
      headers: {
        'Lovable-API-Key': LOVABLE_API_KEY,
        'X-Lovable-AIG-SDK': 'fetch',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: profile.model,
        stream: true,
        store: false,
        reasoning: { effort: profile.effort, summary: 'auto' },
        include: ['reasoning.encrypted_content'],
        input: [
          { role: 'system', content: systemPrompt },
          ...messages.map((message: VoiceMessage) => ({
            role: message.role,
            content: Array.isArray(message.content) ? message.content.map((part: any) => part.type === 'image_url'
              ? { type: 'input_image', image_url: part.image_url.url }
              : { type: 'input_text', text: part.text }) : message.content,
          })),
        ],
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded — please slow down a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Add credits in Settings → Workspace → Usage.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const failure = await aiResp.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: failure.message || failure.error?.message || 'Voice service unavailable' }), {
        status: aiResp.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(aiResp.body, {
      headers: getLovableAiGatewayResponseHeaders(aiResp.headers, { ...corsHeaders, 'Content-Type': 'text/event-stream' }),
    });
  } catch (e) {
    if (req.signal.aborted && e instanceof Error && e.name === 'AbortError') return new Response(null, { status: 499 });
    console.error('voice-chat error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
