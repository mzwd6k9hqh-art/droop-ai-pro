import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Bot,
  BarChart3,
  Globe,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Shield,
  Rocket,
  Users,
  Star,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ZyraMark } from '@/components/ZyraMark';

const features = [
  {
    icon: Bot,
    title: 'ZYRA Assistant',
    description: 'Get intelligent business insights powered by advanced AI. Ask questions and receive data-driven recommendations.',
    color: 'icon-primary',
    gradient: 'from-primary/20 to-accent/20',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Deep-dive into your store performance with comprehensive analytics and actionable insights.',
    color: 'icon-info',
    gradient: 'from-info/20 to-primary/20',
  },
  {
    icon: Globe,
    title: 'Global Market Data',
    description: 'Access real-time market trends, best countries to target, and emerging niches worldwide.',
    color: 'icon-secondary',
    gradient: 'from-secondary/20 to-info/20',
  },
  {
    icon: TrendingUp,
    title: 'Growth Strategies',
    description: 'Receive personalized growth tactics based on your store data and market opportunities.',
    color: 'icon-warning',
    gradient: 'from-warning/20 to-secondary/20',
  },
];

const benefits = [
  'AI-powered business recommendations',
  'Real-time market insights',
  'Competitor analysis & tracking',
  'Country & niche optimization',
  'Conversion rate improvements',
  'Data-driven decision making',
];

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '95%', label: 'Satisfaction' },
  { value: '2.5x', label: 'Avg Growth' },
  { value: '24/7', label: 'AI Support' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <ZyraMark className="h-10 w-10" tile />
            <span className="text-xl font-bold tracking-tight">ZYRA</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/onboarding">
              <Button size="sm" className="gradient-button gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Sales Intelligence</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Boost Your Sales with
              <span className="gradient-text block mt-2">ZYRA</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Transform your e-commerce business with AI-driven insights, market analysis, 
              and personalized growth strategies. Make smarter decisions, faster.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/onboarding">
                <Button size="lg" className="gradient-button gap-2 h-14 px-8 text-lg shadow-xl hover:shadow-2xl transition-shadow">
                  <Rocket className="h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/onboarding">
                <Button size="lg" variant="outline" className="gap-2 h-14 px-8 text-lg">
                  <Bot className="h-5 w-5" />
                  Try ZYRA
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
              <Target className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Powerful Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive tools to analyze, optimize, and scale your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group elevated-card p-6 hover:border-primary/30"
                >
                  <div className={cn('icon-action mb-5', feature.color)}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
                <Star className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">Why ZYRA?</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Make Data-Driven Decisions with Confidence
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop guessing and start growing. Our AI analyzes your store, market trends, 
                and competitors to provide actionable insights that drive results.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link to="/onboarding">
                <Button size="lg" className="gradient-button gap-2">
                  Get Started Now <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              {/* Decorative background */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-3xl" />
              
              {/* Mock dashboard preview */}
              <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 transform rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-3 mb-6">
                  <div className="icon-action icon-solid-primary">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">ZYRA</h3>
                    <p className="text-xs text-muted-foreground">Your AI Sales Assistant</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">Market Opportunity</p>
                    <p className="text-2xl font-bold text-secondary">+127%</p>
                    <p className="text-xs text-muted-foreground">Growth potential detected</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Globe className="h-4 w-4 text-primary mb-1" />
                      <p className="text-xs font-medium">Best Market</p>
                      <p className="text-sm font-semibold">USA</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                      <TrendingUp className="h-4 w-4 text-secondary mb-1" />
                      <p className="text-xs font-medium">Trending</p>
                      <p className="text-sm font-semibold">+45%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 gradient-header" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            
            <div className="relative py-16 px-8 text-center text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur mb-6">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">14-day free trial • No credit card required</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Boost Your Sales?
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
                Join thousands of entrepreneurs using ZYRA to grow their businesses smarter.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/onboarding">
                  <Button size="lg" variant="secondary" className="gap-2 h-12 px-8 shadow-lg">
                    <Rocket className="h-5 w-5" />
                    Start Your Free Trial
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="ghost" className="gap-2 h-12 px-8 text-white hover:bg-white/10">
                    View Pricing <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ZyraMark className="h-8 w-8" tile />
              <span className="font-bold tracking-tight">ZYRA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ZYRA. All rights reserved. Built for e-commerce success.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
