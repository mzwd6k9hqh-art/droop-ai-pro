import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Globe, Copy, Check, Code2, Rocket, Share2, Sparkles, ArrowLeft, Tag } from 'lucide-react';
import { StoreConfig } from '@/components/StorePreview';
import { downloadStoreHTML, generateStoreHTML, publishStorePreview } from '@/lib/exportStore';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: StoreConfig;
}

type Step = 'main' | 'domain' | 'domainPayment' | 'success';

const TLDS = ['.com', '.store', '.shop', '.online'];

export function ExportPublishDialog({ open, onOpenChange, config }: Props) {
  const [step, setStep] = useState<Step>('main');
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [selectedTld, setSelectedTld] = useState('.com');
  const [purchasing, setPurchasing] = useState(false);

  const baseSlug = (config.storeName || 'my-store')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase() || 'my-store';
  const freeUrl = `https://${baseSlug}.zyra.store`;

  const handleDownload = () => {
    downloadStoreHTML(config);
    toast.success('Store downloaded as HTML file!');
  };

  const handlePreview = () => {
    publishStorePreview(config);
    toast.success('Store opened in a new tab');
  };

  const handlePublishFree = () => {
    // Publishing is free — go straight live, then offer optional domain upsell.
    setPublishedUrl(freeUrl);
    localStorage.setItem('droop_store_published', 'true');
    localStorage.setItem('droop_store_published_url', freeUrl);
    toast.success('Your store is live!');
    setStep('domain');
  };

  const [paying, setPaying] = useState(false);
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });


  const handleCopyCode = async () => {
    const html = generateStoreHTML(config);
    await navigator.clipboard.writeText(html);
    setCopied(true);
    toast.success('HTML code copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied');
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: config.storeName || 'My Store', url });
      } catch {}
    } else {
      handleCopyUrl(url);
    }
  };

  const handleBuyDomain = () => {
    if (!customDomain.trim()) {
      toast.error('Please enter a domain name');
      return;
    }
    // Open the $1 checkout page for the domain
    setStep('domainPayment');
  };

  const handlePayDomain = async () => {
    if (!card.number.trim() || !card.expiry.trim() || !card.cvc.trim() || !card.name.trim()) {
      toast.error('Please fill in all card details');
      return;
    }
    setPurchasing(true);
    await new Promise(r => setTimeout(r, 1400));
    const finalUrl = `https://${customDomain.trim().toLowerCase()}${selectedTld}`;
    setPublishedUrl(finalUrl);
    localStorage.setItem('droop_store_published_url', finalUrl);
    setPurchasing(false);
    setStep('success');
    toast.success('🎉 Domain purchased and connected!');
  };


  const handleSkipDomain = () => {
    setStep('success');
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      // Reset on close
      setTimeout(() => setStep('main'), 200);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" dir="ltr">
        {/* MAIN STEP */}
        {step === 'main' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Rocket className="h-5 w-5 text-primary" />
                Export & Publish Your Store
              </DialogTitle>
              <DialogDescription>
                Publish online instantly, download as HTML, or copy the code.
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
                    <h3 className="font-semibold text-sm">Publish Online Instantly</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Get a live, shareable link in seconds</p>
                  </div>
                </div>
                <Button onClick={handlePublishFree} className="w-full gradient-button rounded-lg gap-2">
                  <Rocket className="h-4 w-4" /> Publish Now
                </Button>
              </div>

              {/* Download HTML */}
              <button
                onClick={handleDownload}
                className="w-full text-left rounded-xl border border-border bg-card hover:bg-muted/50 p-4 flex items-center gap-3 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Download className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Download HTML File</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Single file, ready for any host</p>
                </div>
              </button>

              {/* Preview */}
              <button
                onClick={handlePreview}
                className="w-full text-left rounded-xl border border-border bg-card hover:bg-muted/50 p-4 flex items-center gap-3 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Live Preview</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Open the store in a new tab</p>
                </div>
              </button>

              {/* Copy code */}
              <button
                onClick={handleCopyCode}
                className="w-full text-left rounded-xl border border-border bg-card hover:bg-muted/50 p-4 flex items-center gap-3 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  {copied ? <Check className="h-5 w-5 text-purple-600" /> : <Code2 className="h-5 w-5 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{copied ? 'Copied ✓' : 'Copy HTML Code'}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Paste into any editor or site</p>
                </div>
              </button>
            </div>
          </>
        )}

        {/* PAYMENT STEP — required before publishing */}
        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Rocket className="h-5 w-5 text-primary" />
                Publish your store — $9
              </DialogTitle>
              <DialogDescription>
                A one-time activation fee to publish your store live, including hosting & SSL.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total today</p>
                  <p className="text-3xl font-black">$9.00</p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0">One-time</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Cardholder name</label>
                  <Input value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} placeholder="Full name on card" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Card number</label>
                  <Input
                    value={card.number}
                    onChange={e => setCard({ ...card, number: e.target.value.replace(/[^0-9 ]/g, '').slice(0, 19) })}
                    placeholder="4242 4242 4242 4242"
                    className="mt-1 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Expiry</label>
                    <Input
                      value={card.expiry}
                      onChange={e => setCard({ ...card, expiry: e.target.value.replace(/[^0-9/]/g, '').slice(0, 5) })}
                      placeholder="MM/YY"
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">CVC</label>
                    <Input
                      value={card.cvc}
                      onChange={e => setCard({ ...card, cvc: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) })}
                      placeholder="123"
                      className="mt-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePay}
                disabled={paying}
                className="w-full h-11 gradient-button rounded-lg gap-2 font-semibold"
              >
                {paying ? 'Processing payment…' : <>Pay $9 & Publish <Rocket className="h-4 w-4" /></>}
              </Button>
              <button
                onClick={() => setStep('main')}
                className="w-full text-xs text-muted-foreground hover:text-foreground py-2 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <p className="text-[10px] text-center text-muted-foreground">
                🔒 Payments are simulated in this demo. To enable real Stripe checkout, ask Zyra to wire up Lovable Payments.
              </p>
            </div>
          </>
        )}

        {/* DOMAIN UPSELL STEP */}
        {step === 'domain' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Get a Professional Domain
              </DialogTitle>
              <DialogDescription>
                Your store is live! Want a professional domain instead of a subdomain?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Current free URL */}
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">Current free link:</p>
                <p className="text-sm font-mono text-foreground truncate">{freeUrl}</p>
              </div>

              {/* Offer card */}
              <div className="relative rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-pink-500/10 p-5 overflow-hidden">
                <div className="absolute -top-1 -right-1">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold shadow-lg">
                    🔥 Limited Offer
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    Special Launch Price
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-1">
                  Your own professional domain
                </h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-black text-foreground">$1</span>
                  <span className="text-sm text-muted-foreground line-through">$14.99</span>
                  <span className="text-xs font-bold text-emerald-600">SAVE 93%</span>
                </div>

                <ul className="space-y-1.5 mb-4 text-xs text-foreground/80">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Custom .com / .store / .shop domain</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Free SSL certificate (HTTPS)</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Instant connection — no setup</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Builds customer trust & SEO</li>
                </ul>

                {/* Domain search */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={customDomain}
                      onChange={e => setCustomDomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                      placeholder={baseSlug}
                      className="h-10 text-sm bg-background"
                    />
                    <select
                      value={selectedTld}
                      onChange={e => setSelectedTld(e.target.value)}
                      className="h-10 px-3 rounded-md border border-input bg-background text-sm font-semibold"
                    >
                      {TLDS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {customDomain && (
                    <p className="text-xs text-muted-foreground">
                      Preview: <span className="font-mono text-foreground">{customDomain.toLowerCase()}{selectedTld}</span>
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleBuyDomain}
                  disabled={purchasing || !customDomain.trim()}
                  className="w-full mt-4 h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg gap-2 shadow-lg"
                >
                  {purchasing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Get Domain for $1
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  $1 first year, then $12/year. Cancel anytime.
                </p>
              </div>

              <button
                onClick={handleSkipDomain}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                No thanks, continue with free subdomain →
              </button>
            </div>
          </>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && publishedUrl && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Check className="h-5 w-5 text-emerald-500" />
                Your Store is Live! 🎉
              </DialogTitle>
              <DialogDescription>
                Share your store with the world.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-5 text-center">
                <Globe className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Your store URL:</p>
                <p className="text-base font-bold font-mono text-foreground break-all mb-3">{publishedUrl}</p>
                <div className="flex gap-2">
                  <Button onClick={() => handleCopyUrl(publishedUrl)} variant="outline" size="sm" className="flex-1 gap-1.5">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button onClick={() => handleShare(publishedUrl)} variant="outline" size="sm" className="flex-1 gap-1.5">
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </Button>
                  <Button onClick={handlePreview} size="sm" className="flex-1 gap-1.5 gradient-button">
                    <Globe className="h-3.5 w-3.5" /> Visit
                  </Button>
                </div>
              </div>

              <button
                onClick={() => setStep('main')}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" /> Back to export options
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
