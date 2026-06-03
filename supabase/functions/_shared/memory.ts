// Shared memory helpers for Zyra (long-term memory via pgvector)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

export const adminClient = () => createClient(SUPABASE_URL, SERVICE_ROLE);

export async function embedText(text: string): Promise<number[] | null> {
  if (!text?.trim() || !LOVABLE_API_KEY) return null;
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-embedding-001",
        input: text.slice(0, 8000),
      }),
    });
    if (!res.ok) {
      console.error("Embed failed:", res.status, await res.text());
      return null;
    }
    const json = await res.json();
    return json?.data?.[0]?.embedding ?? null;
  } catch (e) {
    console.error("Embed error:", e);
    return null;
  }
}

export async function recallMemories(userId: string, query: string, limit = 6) {
  const embedding = await embedText(query);
  if (!embedding) return [];
  const admin = adminClient();
  // pgvector expects the vector as a string literal "[0.1,0.2,...]"
  const vectorLiteral = `[${embedding.join(",")}]`;
  const { data, error } = await admin.rpc("match_assistant_memory", {
    p_user_id: userId,
    p_query: vectorLiteral as unknown as number[],
    p_limit: limit,
  });
  if (error) {
    console.error("Memory recall error:", error);
    return [];
  }
  return (data || []) as Array<{
    id: string;
    content: string;
    kind: string;
    importance: number;
    similarity: number;
  }>;
}

export async function saveMemories(
  userId: string,
  items: Array<{ content: string; kind?: string; importance?: number; metadata?: Record<string, unknown> }>
) {
  if (!items?.length) return;
  const admin = adminClient();
  const rows: any[] = [];
  for (const item of items) {
    const text = item.content?.trim();
    if (!text) continue;
    const embedding = await embedText(text);
    rows.push({
      user_id: userId,
      content: text,
      kind: item.kind || "fact",
      importance: Math.min(10, Math.max(1, item.importance ?? 5)),
      metadata: item.metadata || {},
      embedding: embedding ? `[${embedding.join(",")}]` : null,
    });
  }
  if (!rows.length) return;
  const { error } = await admin.from("assistant_memory").insert(rows);
  if (error) console.error("Memory save error:", error);
}

export async function extractMemoriesFromExchange(
  userMessage: string,
  assistantReply: string
): Promise<Array<{ content: string; kind: string; importance: number }>> {
  if (!LOVABLE_API_KEY) return [];
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You extract durable, user-specific memories from a chat exchange. " +
              "Return ONLY JSON: { \"memories\": [{ \"content\": string, \"kind\": \"preference|goal|fact|context\", \"importance\": 1-10 }] }. " +
              "Only extract things that would help a future conversation (stable preferences, business goals, store details, recurring intents). " +
              "Skip greetings, one-off questions, and anything trivial. Return { \"memories\": [] } when nothing is worth saving. " +
              "Write memories in third person about 'the user'.",
          },
          {
            role: "user",
            content: `USER: ${userMessage}\n\nASSISTANT: ${assistantReply}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.memories) ? parsed.memories.slice(0, 5) : [];
  } catch (e) {
    console.error("Memory extraction error:", e);
    return [];
  }
}
