import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Package, Palette, Settings as SettingsIcon, Layout, GripVertical } from 'lucide-react';
import { UndoRedoControls } from '@/components/UndoRedoControls';
import { StoreConfig } from '@/components/StorePreview';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Product = NonNullable<StoreConfig['products']>[number];

interface SortableProductProps {
  id: string;
  product: Product;
  onUpdate: (patch: Partial<Product>) => void;
  onRemove: () => void;
}

function SortableProductCard({ id, product, onUpdate, onRemove }: SortableProductProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border border-border bg-card p-3 space-y-2',
        isDragging && 'shadow-lg ring-2 ring-primary/30'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <Input
          className="w-14 text-center text-lg shrink-0"
          value={product.image}
          maxLength={4}
          onChange={e => onUpdate({ image: e.target.value })}
        />
        <div className="flex-1 space-y-2">
          <Input
            value={product.name}
            maxLength={80}
            placeholder="Product name"
            onChange={e => onUpdate({ name: e.target.value })}
          />
          <Input
            value={product.price}
            maxLength={20}
            placeholder="Price"
            onChange={e => onUpdate({ price: e.target.value })}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        value={product.description || ''}
        maxLength={300}
        rows={2}
        placeholder="Product description"
        onChange={e => onUpdate({ description: e.target.value })}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={product.inStock !== false}
            onCheckedChange={v => onUpdate({ inStock: v })}
          />
          <span className="text-xs text-muted-foreground">In stock</span>
        </div>
        <Input
          className="w-24 h-7 text-xs"
          placeholder="Badge"
          maxLength={20}
          value={product.badge || ''}
          onChange={e => onUpdate({ badge: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}

interface StoreEditorPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: StoreConfig;
  onChange: (next: StoreConfig) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const COLOR_PRESETS = [
  { label: 'Pink', primary: 'from-pink-500 to-rose-600', accent: 'bg-pink-100 text-pink-700', bg: 'bg-gradient-to-br from-rose-50 to-pink-50' },
  { label: 'Blue', primary: 'from-blue-500 to-indigo-600', accent: 'bg-blue-100 text-blue-700', bg: 'bg-gradient-to-br from-blue-50 to-indigo-50' },
  { label: 'Orange', primary: 'from-orange-500 to-amber-600', accent: 'bg-orange-100 text-orange-700', bg: 'bg-gradient-to-br from-orange-50 to-amber-50' },
  { label: 'Purple', primary: 'from-purple-500 to-fuchsia-600', accent: 'bg-purple-100 text-purple-700', bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50' },
  { label: 'Green', primary: 'from-green-500 to-emerald-600', accent: 'bg-green-100 text-green-700', bg: 'bg-gradient-to-br from-green-50 to-emerald-50' },
  { label: 'Cyan', primary: 'from-cyan-500 to-teal-600', accent: 'bg-cyan-100 text-cyan-700', bg: 'bg-gradient-to-br from-cyan-50 to-teal-50' },
  { label: 'Gray', primary: 'from-slate-600 to-stone-700', accent: 'bg-slate-100 text-slate-700', bg: 'bg-gradient-to-br from-slate-50 to-stone-50' },
  { label: 'Red', primary: 'from-red-500 to-rose-700', accent: 'bg-red-100 text-red-700', bg: 'bg-gradient-to-br from-red-50 to-rose-50' },
];

export function StoreEditorPanel({ open, onOpenChange, config, onChange, onUndo, onRedo, canUndo, canRedo }: StoreEditorPanelProps) {
  const update = (patch: Partial<StoreConfig>) => onChange({ ...config, ...patch });

  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '📦', description: '' });

  const addProduct = () => {
    const name = newProduct.name.trim();
    if (!name) {
      toast.error('Enter product name');
      return;
    }
    if (name.length > 80) {
      toast.error('Product name is too long');
      return;
    }
    const products = [
      ...(config.products || []),
      {
        name,
        price: newProduct.price.trim() || '$0.00',
        image: newProduct.image.trim() || '📦',
        description: newProduct.description.trim().slice(0, 300) || undefined,
        inStock: true,
      },
    ];
    update({ products });
    setNewProduct({ name: '', price: '', image: '📦', description: '' });
    toast.success('Product added');
  };

  const removeProduct = (idx: number) => {
    const products = (config.products || []).filter((_, i) => i !== idx);
    update({ products });
  };

  const updateProduct = (idx: number, patch: Partial<NonNullable<StoreConfig['products']>[number]>) => {
    const products = (config.products || []).map((p, i) => (i === idx ? { ...p, ...patch } : p));
    update({ products });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const productIds = (config.products || []).map((_, i) => `product-${i}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = productIds.indexOf(String(active.id));
    const newIndex = productIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    update({ products: arrayMove(config.products || [], oldIndex, newIndex) });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="flex items-center gap-2 text-base">
              <SettingsIcon className="h-4 w-4 text-primary" />
              Customize Store
            </SheetTitle>
            {(onUndo || onRedo) && (
              <UndoRedoControls
                onUndo={onUndo!}
                onRedo={onRedo!}
                canUndo={!!canUndo}
                canRedo={!!canRedo}
              />
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-4 mx-3 mt-3 shrink-0">
            <TabsTrigger value="general" className="gap-1 text-xs"><SettingsIcon className="h-3 w-3" /> General</TabsTrigger>
            <TabsTrigger value="design" className="gap-1 text-xs"><Palette className="h-3 w-3" /> Design</TabsTrigger>
            <TabsTrigger value="products" className="gap-1 text-xs"><Package className="h-3 w-3" /> Products</TabsTrigger>
            <TabsTrigger value="layout" className="gap-1 text-xs"><Layout className="h-3 w-3" /> Layout</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <TabsContent value="general" className="space-y-4 mt-0">
              <div className="space-y-1.5">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={config.storeName || ''}
                  maxLength={60}
                  onChange={e => update({ storeName: e.target.value })}
                  placeholder="My Store"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="logo">Logo (Emoji)</Label>
                <Input
                  id="logo"
                  value={config.logo || ''}
                  maxLength={4}
                  onChange={e => update({ logo: e.target.value })}
                  placeholder="🛍️"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Store Description</Label>
                <Textarea
                  id="description"
                  value={config.description || ''}
                  maxLength={300}
                  onChange={e => update({ description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="footerText">Footer Text</Label>
                <Input
                  id="footerText"
                  value={config.footerText || ''}
                  maxLength={120}
                  onChange={e => update({ footerText: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Announcement Bar</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.announcement?.show || false}
                    onCheckedChange={v => update({ announcement: { ...(config.announcement || { text: '' }), show: v } })}
                  />
                  <Input
                    value={config.announcement?.text || ''}
                    maxLength={100}
                    placeholder="Free shipping on orders over $50"
                    onChange={e => update({ announcement: { ...(config.announcement || { show: true }), text: e.target.value } })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Color Palette</Label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map(p => {
                    const isActive = config.primaryColor === p.primary;
                    return (
                      <button
                        key={p.label}
                        onClick={() => update({ primaryColor: p.primary, accentColor: p.accent, bgColor: p.bg })}
                        className={cn(
                          'rounded-lg border-2 overflow-hidden transition-all',
                          isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
                        )}
                      >
                        <div className={cn('h-10 bg-gradient-to-br', p.primary)} />
                        <div className="text-[10px] py-1 text-center text-foreground bg-card">{p.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Border Radius</Label>
                <Select value={config.borderRadius || 'md'} onValueChange={(v: any) => update({ borderRadius: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sharp</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="full">Rounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="heroText">Hero Title</Label>
                <Input
                  id="heroText"
                  value={config.heroText || ''}
                  maxLength={80}
                  onChange={e => update({ heroText: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="heroSub">Hero Subtitle</Label>
                <Input
                  id="heroSub"
                  value={config.heroSubtext || ''}
                  maxLength={150}
                  onChange={e => update({ heroSubtext: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="heroBtn">Hero Button Text</Label>
                <Input
                  id="heroBtn"
                  value={config.heroButtonText || ''}
                  maxLength={30}
                  onChange={e => update({ heroButtonText: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4 mt-0">
              <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2">
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> New Product
                </p>
                <div className="grid grid-cols-[1fr_72px] gap-2">
                  <Input
                    placeholder="Product name"
                    value={newProduct.name}
                    maxLength={80}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                  <Input
                    placeholder="📦"
                    value={newProduct.image}
                    maxLength={4}
                    onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Price e.g. $29.99"
                  value={newProduct.price}
                  maxLength={20}
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                <Textarea
                  placeholder="Short description (optional)"
                  value={newProduct.description}
                  maxLength={300}
                  rows={2}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                />
                <Button onClick={addProduct} className="w-full gradient-button gap-1.5" size="sm">
                  <Plus className="h-3.5 w-3.5" /> Add Product
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Current Products ({config.products?.length || 0})
                  </p>
                  {(config.products?.length || 0) > 1 && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <GripVertical className="h-3 w-3" /> Drag to reorder
                    </p>
                  )}
                </div>
                {(!config.products || config.products.length === 0) && (
                  <div className="text-center text-xs text-muted-foreground py-6 border border-dashed rounded-lg">
                    No products yet. Add your first product above.
                  </div>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={productIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {(config.products || []).map((product, idx) => (
                        <SortableProductCard
                          key={productIds[idx]}
                          id={productIds[idx]}
                          product={product}
                          onUpdate={patch => updateProduct(idx, patch)}
                          onRemove={() => removeProduct(idx)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4 mt-0">
              <div className="space-y-1.5">
                <Label>Product Layout</Label>
                <Select value={config.layout || 'grid'} onValueChange={(v: any) => update({ layout: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Number of Columns</Label>
                <Select value={String(config.productColumns || 2)} onValueChange={(v) => update({ productColumns: Number(v) as 2 | 3 })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Navbar Style</Label>
                <Select value={config.navbarStyle || 'default'} onValueChange={(v: any) => update({ navbarStyle: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="centered">Centered</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground">UI Elements</p>
                {[
                  { key: 'showHero' as const, label: 'Show hero section' },
                  { key: 'showSearch' as const, label: 'Show search' },
                  { key: 'showCart' as const, label: 'Show cart' },
                  { key: 'showWishlist' as const, label: 'Show wishlist' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label className="text-sm font-normal">{item.label}</Label>
                    <Switch
                      checked={(config as any)[item.key] !== false}
                      onCheckedChange={v => update({ [item.key]: v } as any)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
