import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const RECENT_KEY = 'zyra_recent_activity';

function pushRecent(entry: string) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 12)));
  } catch {}
}

export function getRecentActivity(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/**
 * Tracks route changes & key events. Persists to Supabase when signed in,
 * always mirrors to localStorage so Zyra has context even for guests.
 */
export function useActivityTracker() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const lastRoute = useRef<string>('');

  useEffect(() => {
    const route = location.pathname;
    if (route === lastRoute.current) return;
    lastRoute.current = route;

    const label = `visited ${route}`;
    pushRecent(label);

    if (isAuthenticated && user && !user.isGuest) {
      supabase.from('user_activity').insert({
        user_id: user.id,
        event_type: 'route_change',
        route,
      }).then(({ error }) => {
        if (error) console.warn('activity log:', error.message);
      });
    }
  }, [location.pathname, isAuthenticated, user]);
}

export function logActivity(eventType: string, details: Record<string, unknown> = {}) {
  pushRecent(`${eventType}${details.target ? `: ${details.target}` : ''}`);
}
