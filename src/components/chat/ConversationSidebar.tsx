import React from 'react';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  open,
  onClose,
}: ConversationSidebarProps) {
  const grouped = groupByDate(conversations);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 right-0 h-full z-50 lg:static lg:z-0',
          'w-72 bg-sidebar-background border-l border-sidebar-border',
          'flex flex-col transition-transform duration-300',
          'lg:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
          !open && 'lg:flex hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-sidebar-border">
          <h2 className="text-sm font-semibold text-sidebar-foreground">المحادثات</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNew}
              className="h-8 w-8 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
              title="محادثة جديدة"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                لا توجد محادثات بعد
              </p>
            )}

            {grouped.map(group => (
              <div key={group.label}>
                <p className="text-[10px] font-medium text-muted-foreground px-2 py-2 uppercase tracking-wider">
                  {group.label}
                </p>
                {group.items.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => { onSelect(conv.id); onClose(); }}
                    className={cn(
                      'group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-right text-sm transition-colors',
                      activeId === conv.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    <span className="flex-1 truncate">{conv.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                      title="حذف"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}

function groupByDate(conversations: Conversation[]) {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).getTime();

  const groups: { label: string; items: Conversation[] }[] = [
    { label: 'اليوم', items: [] },
    { label: 'أمس', items: [] },
    { label: 'آخر 7 أيام', items: [] },
    { label: 'أقدم', items: [] },
  ];

  for (const conv of conversations) {
    const d = new Date(conv.updatedAt);
    if (d.toDateString() === today) groups[0].items.push(conv);
    else if (d.toDateString() === yesterday) groups[1].items.push(conv);
    else if (d.getTime() > weekAgo) groups[2].items.push(conv);
    else groups[3].items.push(conv);
  }

  return groups.filter(g => g.items.length > 0);
}
