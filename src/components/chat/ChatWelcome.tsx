import React from 'react';
import { Palette, ShoppingBag, Type, LayoutGrid, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ZyraMark } from '@/components/ZyraMark';
import { cn } from '@/lib/utils';

interface ChatWelcomeProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  { icon: Palette, text: 'Change the store colors to deep blue', label: 'Change Colors' },
  { icon: ShoppingBag, text: 'Add a new product priced at $99', label: 'Add Product' },
  { icon: Type, text: 'Change the store name', label: 'Edit Name' },
  { icon: LayoutGrid, text: 'Change product layout to list view', label: 'Change Layout' },
  { icon: Search, text: 'Search for the latest e-commerce trends', label: 'Web Search' },
  { icon: TrendingUp, text: 'Suggest ways to boost my store sales', label: 'Marketing Tips' },
];

export function ChatWelcome({ onSuggestionClick }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-10">
      <ZyraMark className="h-16 w-16 mb-6" tile />
      <p className="text-xs font-bold text-primary mb-3">ZYRA</p>
      <h1 className="text-3xl font-semibold text-foreground mb-3 text-center">What’s on your mind?</h1>
      <p className="text-muted-foreground text-sm mb-8 max-w-md text-center">Let’s make your next idea happen.</p>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl w-full">
        {suggestions.map((s, i) => (
          <Button variant="outline"
            key={i}
            onClick={() => onSuggestionClick(s.text)}
            className={cn(
              'group flex items-center justify-start gap-3 p-4 h-auto rounded-lg text-left whitespace-normal',
              'bg-card border border-border/60 hover:border-primary/30',
              'transition-all hover:shadow-md hover:-translate-y-0.5',
              'text-sm text-foreground'
            )}
          >
            <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <s.icon className="h-4 w-4 text-primary transition-colors" />
            </div>
            <span className="leading-snug">{s.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
