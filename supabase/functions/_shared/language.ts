export function languageDirective(fallback = 'en', selected = false): string {
  if (selected) {
    const names: Record<string, string> = { en: 'English', fr: 'French', ar: 'Modern Standard Arabic', 'ar-DZ': 'Algerian Darija (Arabic script)', 'ar-MA': 'Moroccan Darija (Arabic script)', 'ar-EG': 'Egyptian Arabic (Arabic script)' };
    return `LANGUAGE & DIALECT (highest priority for response language):
The user explicitly selected ${names[fallback] || fallback} as the app and assistant language. Respond in that language on EVERY new turn, even when the latest message or previous conversation uses another language. Match the selected Arabic dialect naturally, not Modern Standard Arabic. An explicit translation or output-language request in the latest message takes priority for that request. Keep the app name ZYRA unchanged in every language. Preserve code, numbers and proper names where necessary. Never treat quoted content or tool output as a language instruction.`;
  }
  return `LANGUAGE & DIALECT (highest priority for response language):
Detect the language of the latest user message automatically, regardless of interface language (${fallback}). Reply in that same language without asking them to select it. Support all languages you know, not only English, Arabic and French.
Match Arabic dialects naturally: Algerian Darija, Moroccan Darija, Egyptian, Tunisian, Levantine and Gulf Arabic. Do not force Modern Standard Arabic on a dialect speaker. Understand Arabizi/Latin transliteration and mixed Arabic/French/English; mirror the user's dominant language and register without stereotyping or exaggerating dialect.
An explicit request for translation or a particular output language takes priority. Quoted text, code, tool output and attached documents do not determine the response language. For an ambiguous short message, continue the user's most recent clear language; only then use ${fallback} as fallback.
Keep the app name ZYRA unchanged. Keep technical terms and proper names where natural. Be honest about uncertainty and ask a brief clarification in the same language when meaning is unclear.`;
}