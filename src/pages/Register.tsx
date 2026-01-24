import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Mail, Lock, User, ArrowRight, Store, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [storeUrlError, setStoreUrlError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const validateStoreUrl = (url: string): boolean => {
    if (!url.trim()) {
      setStoreUrlError('Store URL is required');
      return false;
    }
    
    // Simple URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      setStoreUrlError('Please enter a valid URL (e.g., https://mystore.com)');
      return false;
    }
    
    setStoreUrlError('');
    return true;
  };

  const handleStoreUrlChange = (value: string) => {
    setStoreUrl(value);
    if (storeUrlError) {
      validateStoreUrl(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStoreUrl(storeUrl)) {
      return;
    }
    
    setIsLoading(true);

    // Normalize URL - add https:// if not present
    let normalizedUrl = storeUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const success = await register(email, name, password, normalizedUrl);
    
    if (success) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      toast.error('Email already registered');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-button">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold">Sales Booster</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{t('auth.register')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 input-focus"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 input-focus"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeUrl">
                Store URL <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="storeUrl"
                  type="text"
                  placeholder="https://mystore.com"
                  value={storeUrl}
                  onChange={(e) => handleStoreUrlChange(e.target.value)}
                  onBlur={() => validateStoreUrl(storeUrl)}
                  className={`pl-10 input-focus ${storeUrlError ? 'border-destructive focus:ring-destructive/20' : ''}`}
                  required
                />
              </div>
              {storeUrlError && (
                <p className="text-sm text-destructive flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {storeUrlError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter your store URL for personalized analytics and AI insights
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 input-focus"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2 gradient-button" disabled={isLoading}>
              {isLoading ? 'Creating account...' : t('auth.register')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 gradient-header">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <div className="max-w-md text-center">
              <h1 className="text-4xl font-bold mb-4">Start Growing Today</h1>
              <p className="text-lg opacity-90">
                Join thousands of entrepreneurs using Sales Booster to accelerate their business growth with AI-powered insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
