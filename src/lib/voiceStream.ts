export async function readVoiceStream(response: Response, onDelta: (text: string) => void): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Voice response is empty');
  const decoder = new TextDecoder();
  let buffer = '', reply = '';
  try {
    while (true) {
      const chunk = await reader.read();
      buffer += decoder.decode(chunk.value, { stream: !chunk.done });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() || '';
      for (const frame of frames) {
        const data = frame.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n');
        if (!data || data === '[DONE]') continue;
        const event = JSON.parse(data);
        if (event.type === 'error' || event.type === 'response.failed') throw new Error(event.error?.message || event.response?.error?.message || 'Voice response failed');
        if (event.type === 'response.refusal.delta') throw new Error(event.delta || 'This request was declined');
        if (event.type === 'response.output_text.delta') {
          reply += event.delta;
          onDelta(event.delta);
        }
      }
      if (chunk.done) break;
    }
    if (!reply.trim()) throw new Error('ZYRA returned no spoken response');
    return reply.trim();
  } finally { reader.releaseLock(); }
}