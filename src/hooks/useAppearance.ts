import { useEffect, useState } from 'react';
import { loadAppearance, type Appearance } from '@/lib/appearance';

export function useAppearance(): Appearance {
  const [appearance, setAppearance] = useState<Appearance>(() => loadAppearance());

  useEffect(() => {
    const onChange = (e: Event) => setAppearance((e as CustomEvent).detail || loadAppearance());
    window.addEventListener('zyra-appearance-changed', onChange);
    return () => window.removeEventListener('zyra-appearance-changed', onChange);
  }, []);

  return appearance;
}
