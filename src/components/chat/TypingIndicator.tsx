import React from 'react';
import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="w-full bg-muted/30">
      <div className="max-w-3xl mx-auto flex gap-4 px-4 py-6 md:px-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold text-primary">DROOB AI</p>
          <div className="flex items-center gap-1.5 pt-1">
            <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
