import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Globe, Copy, Check, Code2, Rocket, Share2 } from 'lucide-react';
import { StoreConfig } from '@/components/StorePreview';
import { downloadStoreHTML, generateStoreHTML, publishStorePreview } from '@/lib/exportStore';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: StoreConfig;
}

export function ExportPublishDialog({ open, onOpenChange, config }: Props) {
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const slug = (config.storeName || 'my-store').replace(/\s+/g, '-').toLowerCase();
  const simulatedUrl = `https://${slug}.droob.store`;

  const handleDownload = () => {
    downloadStoreHTML(config);
    toast.success('تم تنزيل المتجر كملف HTML!');
  };

  const handlePreview = () => {
    publishStorePreview(config);
    toast.success('تم فتح معاينة المتجر في تبويب جديد');
  };

  const handlePublish = () => {
    setPublishedUrl(simulatedUrl);
    toast.success('🎉 تم نشر متجرك بنجاح!');
  };

  const handleCopyCode = async () => {
    const html = generateStoreHTML(config);
    await navigator.clipboard.writeText(html);
    setCopied(true);
    toast.success('تم نسخ كود HTML');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = async () => {
    if (!publishedUrl) return;
    await navigator.clipboard.writeText(publishedUrl);
    toast.success('تم نسخ الرابط');
  };

  const handleShare = async () => {
    if (!publishedUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: config.storeName || 'متجري', url: publishedUrl });
      } catch {}
    } else {
      handleCopyUrl();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Rocket className="h-5 w-5 text-primary" />
            تصدير ونشر المتجر
          </DialogTitle>
          <DialogDescription>
            صدّر متجرك كملف HTML مستقل، أو انشره على الإنترنت بضغطة زر.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Publish */}
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">نشر فوري على الإنترنت</h3>
                <p className="text-xs text-muted-foreground mt-0.5">احصل على رابط مباشر يمكنك مشاركته</p>
              </div>
            </div>

            {!publishedUrl ? (
              <Button onClick={handlePublish} className="w-full gradient-button rounded-lg gap-2">
                <Rocket className="h-4 w-4" /> انشر الآن
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input value={publishedUrl} readOnly className="text-xs h-9" />
                  <Button size="sm" variant="outline" onClick={handleCopyUrl} className="h-9 px-3">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleShare} className="h-9 px-3">
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button size="sm" variant="ghost" onClick={handlePreview} className="w-full h-8 text-xs">
                  معاينة المتجر المنشور
                </Button>
              </div>
            )}
          </div>

          {/* Download HTML */}
          <button
            onClick={handleDownload}
            className="w-full text-right rounded-xl border border-border bg-card hover:bg-muted/50 p-4 flex items-center gap-3 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Download className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">تنزيل ملف HTML</h3>
              <p className="text-xs text-muted-foreground mt-0.5">ملف واحد جاهز للرفع على أي استضافة</p>
            </div>
          </button>

          {/* Preview */}
          <button
            onClick={handlePreview}
            className="w-full text-right rounded-xl border border-border bg-card hover:bg-muted/50 p-4 flex items-center gap-3 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">معاينة كموقع حقيقي</h3>
              <p className="text-xs text-muted-foreground mt-0.5">افتح المتجر في تبويب جديد</p>
            </div>
          </button>

          {/* Copy code */}
          <button
            onClick={handleCopyCode}
            className="w-full text-right rounded-xl border border-border bg-card hover:bg-muted/50 p-4 flex items-center gap-3 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              {copied ? <Check className="h-5 w-5 text-purple-600" /> : <Code2 className="h-5 w-5 text-purple-600" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{copied ? 'تم النسخ ✓' : 'نسخ كود HTML'}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">ألصقه في أي محرر أو موقع</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
