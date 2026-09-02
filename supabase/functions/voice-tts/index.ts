// TTS for ZYRA voice calls.
// Primary: ElevenLabs (if key present). Fallback: Lovable AI Gateway TTS.
// Always returns { audioContent: base64 mp3 } on success, or { fallback: true } so
// the client can gracefully use browser speech synthesis.
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function elevenLabs(text: string, voiceId?: string): Promise<Uint8Array | null> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) return null;
  const vId = voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Sarah — warm conversational
  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${vId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
          style: 0.45,
          use_speaker_boost: true,
          speed: 1.02,
        },
      }),
    }
  );
  if (!resp.ok) {
    console.warn('ElevenLabs unavailable', resp.status, (await resp.text()).slice(0, 200));
    return null;
  }
  return new Uint8Array(await resp.arrayBuffer());
}

async function gatewayTts(text: string): Promise<Uint8Array | null> {
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) return null;
  const resp = await fetch('https://ai.gateway.lovable.dev/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini-tts',
      input: text,
      voice: 'alloy',
      response_format: 'mp3',
      instructions: 'Speak warmly and naturally, like a friendly person on a phone call.',
    }),
  });
  if (!resp.ok) {
    console.warn('Gateway TTS failed', resp.status, (await resp.text()).slice(0, 200));
    return null;
  }
  return new Uint8Array(await resp.arrayBuffer());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { text, voiceId } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let audio: Uint8Array | null = null;
    try { audio = await elevenLabs(text, voiceId); } catch (e) { console.warn('ElevenLabs error', e); }
    if (!audio) {
      try { audio = await gatewayTts(text); } catch (e) { console.warn('Gateway TTS error', e); }
    }

    if (!audio) {
      return new Response(JSON.stringify({ fallback: true, reason: 'No TTS provider available' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ audioContent: base64Encode(audio) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('voice-tts error', e);
    return new Response(JSON.stringify({ fallback: true, reason: e instanceof Error ? e.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
