import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function PublishedStore() {
  const { storeId } = useParams();
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    supabase.functions.invoke('public-store', { body: { storeId } }).then(({ data, error }) => {
      if (!active) return;
      if (error || typeof data?.html !== 'string') setFailed(true);
      else setHtml(data.html);
    });
    return () => { active = false; };
  }, [storeId]);
  if (failed) return <div className="p-8 text-foreground bg-background">Store unavailable</div>;
  if (!html) return <div className="p-8 text-foreground bg-background">Loading store…</div>;
  return <iframe title="Store" srcDoc={html} sandbox="allow-scripts allow-forms allow-popups" className="h-[100dvh] w-full border-0" />;
}