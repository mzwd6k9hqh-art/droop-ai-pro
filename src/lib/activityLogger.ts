import { supabase } from '@/integrations/supabase/client';

export type ActivityEventType =
  | 'page_view'
  | 'navigation'
  | 'store_action'
  | 'product_action'
  | 'ai_interaction'
  | 'auth'
  | 'custom';

interface LogPayload {
  event_type: ActivityEventType;
  action?: string;
  target?: string;
  route?: string;
  metadata?: Record<string, unknown>;
  session_id?: string;
}

function getSessionId(): string {
  const key = 'droop_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export async function logActivity(payload: LogPayload): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Only log for authenticated users (RLS protects table)

    await supabase.from('activity_logs' as any).insert({
      user_id: user.id,
      event_type: payload.event_type,
      action: payload.action ?? null,
      target: payload.target ?? null,
      route: payload.route ?? window.location.pathname,
      metadata: payload.metadata ?? {},
      session_id: payload.session_id ?? getSessionId(),
      user_agent: navigator.userAgent,
    });
  } catch (err) {
    // Silent fail - activity logging should never break the app
    console.warn('[activityLogger] failed to log', err);
  }
}

export const trackPageView = (route?: string) =>
  logActivity({ event_type: 'page_view', route: route ?? window.location.pathname });

export const trackStoreAction = (action: string, target?: string, metadata?: Record<string, unknown>) =>
  logActivity({ event_type: 'store_action', action, target, metadata });

export const trackAiInteraction = (action: string, metadata?: Record<string, unknown>) =>
  logActivity({ event_type: 'ai_interaction', action, metadata });
