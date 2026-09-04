import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share, X, Plus } from 'lucide-react';

const DISMISS_KEY = 'zyra_install_prompt_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === 'true') return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // iOS has no beforeinstallprompt — show manual instructions instead
    if (isIOS()) {
      setIos(true);
      const timer = setTimeout(() => setShow(true), 4000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', onPrompt);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setShow(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(26rem,calc(100%-2rem))] animate-slide-up">
      <div className="elevated-card p-4 shadow-xl border-primary/30 bg-background/95 backdrop-blur">
        <div className="flex items-start gap-3">
          <img src="/icon-192.png" alt="ZYRA app icon" width={40} height={40} loading="lazy" className="h-10 w-10 rounded-xl" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Add ZYRA to your Home Screen</p>
            {ios ? (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 flex-wrap">
                Tap <Share className="h-3 w-3 inline" /> Share, then <Plus className="h-3 w-3 inline" /> "Add to Home Screen".
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Install the app for a full-screen, faster experience.
              </p>
            )}
            {!ios && (
              <Button size="sm" className="gradient-button gap-2 mt-3" onClick={install}>
                <Download className="h-4 w-4" /> Install
              </Button>
            )}
          </div>
          <button onClick={dismiss} aria-label="Dismiss install prompt" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
