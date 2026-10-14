export function voiceModelProfile(model: unknown) {
  if (model === 'openai/gpt-5.6-luna') return {
    model, effort: 'low', sentences: 2,
    direction: 'Zero 1.6: prioritize the fastest useful answer. Use one or two short sentences; solve simple tasks directly without preamble.',
  };
  if (model === 'openai/gpt-5.6-sol') return {
    model, effort: 'low', sentences: 6,
    direction: 'Rot 1.0: handle complex problems carefully. Lead with the answer immediately, then explain in up to six concise spoken sentences when needed. Simple questions still get a short answer.',
  };
  return {
    model: 'openai/gpt-5.6-terra', effort: 'low', sentences: 3,
    direction: 'Ano 2.2: give a balanced everyday answer in two or three natural sentences. Lead with useful information, not a greeting.',
  };
}