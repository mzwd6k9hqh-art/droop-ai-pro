import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logActivity } from './useActivityTracker';

/**
 * Proactive assistant — watches for runtime errors, repeated navigation loops,
 * and 4xx/5xx network responses, then nudges the user toward Zyra for help.
 */
export function useProactiveAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const visitCount = useRef<Record<string, number>>({});
  const lastNudge = useRef(0);

  const nudge = (title: string, description: string) => {
    const now = Date.now();
    if (now - lastNudge.current < 20_000) return; // throttle
    lastNudge.current = now;
    toast(title, {
      description,
      action: { label: 'Ask Zyra', onClick: () => navigate('/ai') },
    });
  };

  // Window error listener
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      logActivity('runtime_error', { target: e.message });
      nudge('Something went wrong', 'Zyra noticed an error and can help you debug it.');
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      logActivity('promise_rejection', { target: String(e.reason).slice(0, 80) });
      nudge('A background task failed', 'Want Zyra to investigate?');
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  // Loop / stuck detection: same route 4+ times in 2 minutes
  useEffect(() => {
    const key = location.pathname;
    visitCount.current[key] = (visitCount.current[key] || 0) + 1;
    if (visitCount.current[key] === 4) {
      nudge('Stuck here?', 'You\'ve been bouncing around this page. Zyra can show you the next step.');
    }
    const t = setTimeout(() => { visitCount.current[key] = 0; }, 120_000);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // Patch fetch to spot failed requests
  useEffect(() => {
    const orig = window.fetch;
    window.fetch = async (...args) => {
      try {
        const res = await orig(...args);
        if (!res.ok && res.status >= 500) {
          logActivity('http_error', { target: `${res.status} ${args[0]}` });
          nudge('A request failed', 'Zyra can help you figure out what broke.');
        }
        return res;
      } catch (err) {
        nudge('Network issue', 'Check your connection — Zyra is here when you\'re back.');
        throw err;
      }
    };
    return () => { window.fetch = orig; };
  }, []);
}
