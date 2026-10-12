export function initialSpeechLanguage(fallback: string, browserLanguage: string): string {
  if (browserLanguage.toLowerCase().startsWith(`${fallback.toLowerCase()}-`)) return browserLanguage;
  return { ar: 'ar-DZ', fr: 'fr-FR', en: 'en-US' }[fallback] || browserLanguage || fallback;
}

export async function detectSpeechLanguage(text: string, fallback: string): Promise<string> {
  if (/[\u0600-\u06ff]/u.test(text) && !/[\u067e\u0686\u0698\u06af\u06cc]/u.test(text)) {
    return fallback.startsWith('ar') ? fallback : 'ar';
  }
  if (text.length < 20) return fallback;
  const [{ franc }, { iso6393 }] = await Promise.all([import('franc-min'), import('iso-639-3')]);
  const detected = franc(text, { minLength: 20 });
  if (detected === 'und') return fallback;
  return iso6393.find(language => language.iso6393 === detected)?.iso6391 || fallback;
}