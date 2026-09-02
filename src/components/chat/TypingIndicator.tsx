import React from 'react';
import { Sparkles } from 'lucide-react';
import { ZyraMark } from '@/components/ZyraMark';

export function TypingIndicator() {
  return (
    <div className="w-full bg-muted/30">
      <div className="max-w-3xl mx-auto flex gap-4 px-4 py-6 md:px-6">
        <ZyraMark className="h-8 w-8 shrink-0 rounded-full" tile />
        <div className="flex-1 space-y-2">
          <p className="text-xs font-bold tracking-tight text-primary">ZYRA</p>
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
