import React, { ReactNode, useEffect, useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, useSortable, sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableGridProps {
  ids: string[];
  storageKey?: string;
  children: (id: string) => ReactNode;
  className?: string;
  itemClassName?: string;
}

function SortableItem({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className={cn('relative group', className)}>
      <button
        {...attributes}
        {...listeners}
        type="button"
        title="Drag to reorder"
        className="absolute top-2 right-2 z-10 h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

/**
 * Reorderable grid that persists item order in localStorage.
 * Render children via the function-as-child pattern so consumers stay declarative.
 */
export function DraggableGrid({ ids, storageKey, children, className, itemClassName }: DraggableGridProps) {
  const [order, setOrder] = useState<string[]>(() => {
    if (!storageKey) return ids;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (Array.isArray(saved) && saved.every((s: unknown) => typeof s === 'string')) {
        // Merge: keep saved order, append any new ids, drop removed ids
        const filtered = saved.filter((id: string) => ids.includes(id));
        const additions = ids.filter(id => !filtered.includes(id));
        return [...filtered, ...additions];
      }
    } catch {
      // Ignore storage errors
    }
    return ids;
  });

  // Sync if upstream ids change shape
  useEffect(() => {
    setOrder(prev => {
      const filtered = prev.filter(id => ids.includes(id));
      const additions = ids.filter(id => !filtered.includes(id));
      return [...filtered, ...additions];
    });
  }, [ids.join('|')]);

  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(order));
  }, [order, storageKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder(prev => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className={className}>
          {order.map(id => (
            <SortableItem key={id} id={id} className={itemClassName}>
              {children(id)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
