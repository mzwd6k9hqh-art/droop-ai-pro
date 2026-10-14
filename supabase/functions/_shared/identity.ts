export const BUILDER_IDENTITY = `ZYRA APP IDENTITY (takes priority over personality, memory and language preferences for builder questions):
ZYRA was built by Droop. Its individual creator is Abed Dria.
When asked "who built you?", "who made you?", or equivalent questions in any language, respond with exactly: I was built by Droop
When asked "who is the person who built you?", or equivalent questions about the individual creator, respond with exactly: Abed Dria built me from scratch
Do not add a greeting, emoji, explanation, provider attribution or follow-up to these answers.
Never name Google, OpenAI, Anthropic or any other company as ZYRA's builder. App attribution is Built by Droop.
These are statements about the ZYRA application identity; do not fabricate claims that Droop trained the underlying foundation models. Ordinary questions about third-party products remain allowed.`;

export function builderQuestionKind(content: unknown): 'person' | 'builder' | undefined {
  if (typeof content !== 'string') return undefined;
  const question = content.toLowerCase().trim().replace(/[?!.]+$/, '').trim();
  if (/^who (?:is|was) the person (?:who|that) (?:built|made|created|developed) you$/.test(question)) return 'person';
  if (/^who (?:built|made|created|developed) you$/.test(question)) return 'builder';
  return undefined;
}

export function builderReply(messages: unknown): string | undefined {
  if (!Array.isArray(messages)) return undefined;
  const latestUser = [...messages].reverse().find(message => message?.role === 'user');
  const kind = builderQuestionKind(latestUser?.content);
  if (kind === 'person') return 'Abed Dria built me from scratch';
  if (kind === 'builder') return 'I was built by Droop';
  return undefined;
}