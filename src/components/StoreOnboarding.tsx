import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Store,
  Globe,
  ShoppingBag,
  Palette,
  Shirt,
  Utensils,
  Laptop,
  Heart,
  Dumbbell,
  BookOpen,
  Baby,
  Home as HomeIcon,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OnboardingResult {
  hasStore: boolean;
  storeUrl?: string;
  storeType?: string;
  interests?: string[];
  storeName?: string;
  description?: string;
}

interface StoreOnboardingProps {
  onComplete: (result: OnboardingResult) => void;
}

const STORE_TYPES = [
  { id: 'fashion', label: 'Fashion & Clothing', icon: Shirt },
  { id: 'electronics', label: 'Electronics & Tech', icon: Laptop },
  { id: 'food', label: 'Food & Beverages', icon: Utensils },
  { id: 'beauty', label: 'Beauty & Health', icon: Heart },
  { id: 'sports', label: 'Sports & Fitness', icon: Dumbbell },
  { id: 'books', label: 'Books & Education', icon: BookOpen },
  { id: 'kids', label: 'Kids & Baby', icon: Baby },
  { id: 'home', label: 'Home & Living', icon: HomeIcon },
];

const INTERESTS = [
  'SEO & Marketing',
  'Product Photography',
  'Social Media Sales',
  'Email Marketing',
  'Brand Identity',
  'Customer Loyalty',
  'Pricing Strategy',
  'Mobile Experience',
  'Payment Methods',
  'Shipping & Logistics',
];

type Step = 'welcome' | 'has-store' | 'store-url' | 'store-type' | 'interests' | 'store-name';

export default function StoreOnboarding({ onComplete }: StoreOnboardingProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const [storeUrl, setStoreUrl] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [urlError, setUrlError] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError('Please enter your store URL');
      return false;
    }
    try {
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      setUrlError('');
      return true;
    } catch {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };

  const handleYes = () => {
    setHasStore(true);
    setStep('store-url');
  };

  const handleNo = () => {
    setHasStore(false);
    setStep('store-type');
  };

  const handleUrlSubmit = () => {
    if (validateUrl(storeUrl)) {
      const finalUrl = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
      // Navigate to analysis page instead of completing onboarding
      if ((window as any).__navigateToAnalysis) {
        (window as any).__navigateToAnalysis(finalUrl);
      } else {
        onComplete({ hasStore: true, storeUrl: finalUrl });
      }
    }
  };

  const handleTypeNext = () => {
    if (selectedType) setStep('interests');
  };

  const handleInterestsNext = () => {
    setStep('store-name');
  };

  const handleFinalSubmit = () => {
    onComplete({
      hasStore: false,
      storeType: selectedType,
      interests: selectedInterests,
      storeName: storeName.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in px-4">
      {/* AI Avatar */}
      <div className="relative mb-8">
        <div className="p-5 rounded-2xl gradient-button shadow-xl">
          <Bot className="h-10 w-10 text-primary-foreground" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent" />
      </div>

      {/* Welcome Step */}
      {step === 'welcome' && (
        <div className="text-center animate-slide-up max-w-md">
          <h2 className="text-2xl font-bold mb-3">Welcome to Zyra! 👋</h2>
          <p className="text-muted-foreground text-lg mb-8">
            I'm your AI-powered store assistant. Let me help you build or optimize your online store.
          </p>
          <Button
            onClick={() => setStep('has-store')}
            className="gradient-button rounded-xl px-8 h-12 text-base gap-2"
          >
            Let's Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Has Store Question */}
      {step === 'has-store' && (
        <div className="text-center animate-slide-up max-w-lg">
          <h2 className="text-2xl font-bold mb-3">Do you already have a store? 🏪</h2>
          <p className="text-muted-foreground mb-8">
            If you have an existing store, I can analyze it and help you improve. Otherwise, I'll help you create one!
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleYes}
              className="gradient-button rounded-xl px-8 h-12 text-base gap-2"
            >
              <Store className="h-5 w-5" /> Yes, I have a store
            </Button>
            <Button
              onClick={handleNo}
              variant="outline"
              className="rounded-xl px-8 h-12 text-base gap-2 border-primary/30 hover:bg-primary/5"
            >
              <ShoppingBag className="h-5 w-5" /> No, create one
            </Button>
          </div>
        </div>
      )}

      {/* Store URL Input */}
      {step === 'store-url' && (
        <div className="text-center animate-slide-up max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-3">What's your store URL? 🔗</h2>
          <p className="text-muted-foreground mb-6">
            Paste your store link and I'll analyze it to give you tailored advice.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={storeUrl}
                onChange={(e) => {
                  setStoreUrl(e.target.value);
                  setUrlError('');
                }}
                placeholder="https://your-store.com"
                className="pl-10 h-12 rounded-xl input-focus"
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
            </div>
            <Button
              onClick={handleUrlSubmit}
              className="gradient-button rounded-xl h-12 px-6"
              disabled={!storeUrl.trim()}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {urlError && (
            <p className="text-destructive text-sm mt-2">{urlError}</p>
          )}
          <button
            onClick={() => setStep('has-store')}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
        </div>
      )}

      {/* Store Type Selection */}
      {step === 'store-type' && (
        <div className="text-center animate-slide-up max-w-2xl w-full">
          <h2 className="text-2xl font-bold mb-3">What type of store do you want? 🛍️</h2>
          <p className="text-muted-foreground mb-6">
            Choose the category that best fits your dream store.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {STORE_TYPES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedType(id)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-sm',
                  selectedType === id
                    ? 'border-primary bg-primary/10 text-primary shadow-md'
                    : 'border-border/50 bg-card hover:border-primary/30 hover:shadow-sm'
                )}
              >
                <div className={cn(
                  'p-2 rounded-lg',
                  selectedType === id ? 'bg-primary/20' : 'bg-muted'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => setStep('has-store')}
              className="rounded-xl h-10 gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleTypeNext}
              className="gradient-button rounded-xl h-10 gap-1"
              disabled={!selectedType}
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Interests Selection */}
      {step === 'interests' && (
        <div className="text-center animate-slide-up max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-3">What matters most to you? 🎯</h2>
          <p className="text-muted-foreground mb-6">
            Select topics you're interested in (optional).
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                  selectedInterests.includes(interest)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/50 bg-card hover:border-primary/30'
                )}
              >
                {selectedInterests.includes(interest) && <Check className="h-3 w-3 inline mr-1" />}
                {interest}
              </button>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => setStep('store-type')}
              className="rounded-xl h-10 gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleInterestsNext}
              className="gradient-button rounded-xl h-10 gap-1"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Store Name & Description */}
      {step === 'store-name' && (
        <div className="text-center animate-slide-up max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-3">Almost done! ✨</h2>
          <p className="text-muted-foreground mb-6">
            Give your store a name and describe what you want (optional).
          </p>
          <div className="space-y-4 max-w-md mx-auto text-left">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Store Name</label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. My Awesome Store"
                className="h-12 rounded-xl input-focus"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Describe your vision</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. A modern minimal store selling handmade jewelry..."
                className="w-full h-24 px-4 py-3 rounded-xl border border-input bg-background text-sm resize-none input-focus"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => setStep('interests')}
              className="rounded-xl h-10 gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleFinalSubmit}
              className="gradient-button rounded-xl h-10 gap-2"
            >
              <Sparkles className="h-4 w-4" /> Create My Store
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
