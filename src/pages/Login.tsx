import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Mail, Lock, ArrowRight, Sparkles, TrendingUp, Globe, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const features = [
  { icon: Bot, text: 'AI-Powered Business Insights' },
  { icon: TrendingUp, text: 'Growth Strategies & Analytics' },
  { icon: Globe, text: 'Global Market Intelligence' },
  { icon: BarChart3, text: 'Real-Time Performance Data' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const onboardingComplete = localStorage.getItem('droop_onboarding_complete');
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2.5 mb-8">
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-button shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">DROOP AI</span>
                <span className="text-xs text-muted-foreground">Sales Booster</span>
              </div>
            </Link>
            <h2 className="text-2xl font-bold tracking-tight">{t('auth.login')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Sign up free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="pl-10 h-12 input-focus"
                  required
                />
              </div>
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
                  className="pl-10 h-12 input-focus"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 gap-2 gradient-button text-base" disabled={isLoading}>
              {isLoading ? 'Signing in...' : t('auth.login')}
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur mb-8">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">AI-Powered Platform</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Welcome Back to DROOP AI</h1>
              <p className="text-lg opacity-90 mb-10">
                Continue growing your business with intelligent insights and data-driven recommendations.
              </p>
              
              <div className="space-y-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-left bg-white/10 backdrop-blur rounded-xl p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
