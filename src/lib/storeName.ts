const STORE_CONTEXT_KEY = 'droop_store_context';
const STORE_CONFIG_KEY = 'droop_store_config';

function read(key: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** The user's actual store name, from the saved store config or onboarding context. */
export function getStoreName(fallback = 'Your Store'): string {
  if (typeof window === 'undefined') return fallback;
  const config = read(STORE_CONFIG_KEY);
  const context = read(STORE_CONTEXT_KEY);
  const name =
    (config?.storeName as string) ||
    (context?.storeName as string) ||
    (context?.storeType as string) ||
    '';
  return name.trim() || fallback;
}
