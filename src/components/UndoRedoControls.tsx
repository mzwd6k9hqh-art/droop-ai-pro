import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UndoRedoControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  className?: string;
  size?: 'sm' | 'icon';
}

export function UndoRedoControls({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  className,
  size = 'icon',
}: UndoRedoControlsProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 shadow-sm', className)}>
      <Button
        type="button"
        variant="ghost"
        size={size}
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="h-8 w-8"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size={size}
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        className="h-8 w-8"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
