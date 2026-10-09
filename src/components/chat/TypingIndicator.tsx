import React from 'react';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { ZyraMark } from '@/components/ZyraMark';

export function TypingIndicator() {
  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto flex gap-4 px-4 py-6 md:px-6">
        <ZyraMark className="h-8 w-8 shrink-0 rounded-full" tile />
        <div className="flex-1 space-y-2">
          <p className="text-xs font-bold tracking-tight text-primary">ZYRA</p>
          <Shimmer className="text-sm">Thinking…</Shimmer>
        </div>
      </div>
    </div>
  );
}
