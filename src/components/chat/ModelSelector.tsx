import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Crown, Check, Zap, Sparkle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AI_MODELS, AiModelOption, resolveModel } from '@/lib/aiModels';
import { loadPreferences, savePreferences } from '@/lib/preferences';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const icons = [Zap, Sparkle, Crown];

export function ModelSelector() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPaid = !!user && user.plan !== 'free';
  const [current, setCurrent] = useState(() => resolveModel(loadPreferences().aiModel, isPaid));
  const [paywall, setPaywall] = useState(false);

  useEffect(() => {
    const prefs = loadPreferences();
    const allowed = resolveModel(prefs.aiModel, isPaid);
    setCurrent(allowed);
    if (prefs.aiModel !== allowed.id) savePreferences({ ...prefs, aiModel: allowed.id });
    const onChange = (e: Event) => setCurrent(resolveModel((e as CustomEvent).detail?.aiModel, isPaid));
    window.addEventListener('zyra-preferences-changed', onChange);
    return () => window.removeEventListener('zyra-preferences-changed', onChange);
  }, [isPaid]);

  const choose = (m: AiModelOption) => {
    if (m.pro && !isPaid) { setPaywall(true); return; }
    savePreferences({ ...loadPreferences(), aiModel: m.id });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="action" size="sm" className="h-8 gap-1.5 rounded-full px-3 text-xs font-semibold" aria-label="Choose model">
            {current.name}
            {current.pro && <Crown className="h-3 w-3 text-primary" />}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-72 rounded-xl p-2">
          {AI_MODELS.map((m, i) => {
            const Icon = icons[i];
            return (
              <DropdownMenuItem key={m.id} onSelect={() => choose(m)} className="gap-3 rounded-lg p-3 cursor-pointer items-start">
                <span className={cn('h-8 w-8 shrink-0 rounded-lg flex items-center justify-center',
                  m.pro ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary')}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {m.name}
                    {m.pro ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        <Crown className="h-2.5 w-2.5" /> Pro
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Free</span>
                    )}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{m.description}</span>
                </span>
                {current.id === m.id && <Check className="h-4 w-4 text-primary mt-1" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={paywall} onOpenChange={setPaywall}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-primary" /> Unlock Rot 1.0</AlertDialogTitle>
            <AlertDialogDescription>
              Rot 1.0 is ZYRA's smartest model for coding, deep analysis and complex problems. It's available on paid plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/upgrade')}>Upgrade</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
