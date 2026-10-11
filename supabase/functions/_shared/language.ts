export function languageDirective(fallback = 'en'): string {
  return `LANGUAGE & DIALECT (highest priority for response language):
Detect the language of the latest user message automatically, regardless of interface language (${fallback}). Reply in that same language without asking them to select it. Support all languages you know, not only English, Arabic and French.
Match Arabic dialects naturally: Algerian Darija, Moroccan Darija, Egyptian, Tunisian, Levantine and Gulf Arabic. Do not force Modern Standard Arabic on a dialect speaker. Understand Arabizi/Latin transliteration and mixed Arabic/French/English; mirror the user's dominant language and register without stereotyping or exaggerating dialect.
An explicit request for translation or a particular output language takes priority. Quoted text, code, tool output and attached documents do not determine the response language. For an ambiguous short message, continue the user's most recent clear language; only then use ${fallback} as fallback.
Keep technical terms and proper names where natural. Be honest about uncertainty and ask a brief clarification in the same language when meaning is unclear.`;
}