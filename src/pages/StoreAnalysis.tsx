import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Globe, TrendingUp, Palette, ShoppingBag, Search, Shield, 
  Zap, ArrowRight, CheckCircle2, AlertTriangle, Info,
  BarChart3, Smartphone, Clock, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AnalysisCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  score: number;
  status: 'excellent' | 'good' | 'needs-work';
  details: string[];
}

const generateAnalysis = (url: string): AnalysisCategory[] => {
  // Simulate analysis based on URL
  const hash = url.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  const seed = Math.abs(hash);
  
  return [
    {
      id: 'seo',
      label: 'SEO & Visibility',
      icon: Search,
      score: 40 + (seed % 50),
      status: (40 + (seed % 50)) > 75 ? 'excellent' : (40 + (seed % 50)) > 50 ? 'good' : 'needs-work',
      details: [
        'Meta descriptions need optimization',
        'Missing alt tags on product images',
        'Good URL structure detected',
        'Sitemap needs updating',
      ],
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: Zap,
      score: 50 + (seed % 40),
      status: (50 + (seed % 40)) > 75 ? 'excellent' : (50 + (seed % 40)) > 50 ? 'good' : 'needs-work',
      details: [
        'Page load time can be improved',
        'Images need compression',
        'CSS is well optimized',
        'Consider lazy loading for images',
      ],
    },
    {
      id: 'design',
      label: 'Design & UX',
      icon: Palette,
      score: 45 + (seed % 45),
      status: (45 + (seed % 45)) > 75 ? 'excellent' : (45 + (seed % 45)) > 50 ? 'good' : 'needs-work',
      details: [
        'Color scheme could be more cohesive',
        'Typography hierarchy is decent',
        'CTA buttons need more contrast',
        'Layout is clean and organized',
      ],
    },
    {
      id: 'mobile',
      label: 'Mobile Experience',
      icon: Smartphone,
      score: 55 + (seed % 35),
      status: (55 + (seed % 35)) > 75 ? 'excellent' : (55 + (seed % 35)) > 50 ? 'good' : 'needs-work',
      details: [
        'Responsive design detected',
        'Touch targets could be larger',
        'Mobile menu needs improvement',
        'Good font sizing for mobile',
      ],
    },
    {
      id: 'products',
      label: 'Product Presentation',
      icon: ShoppingBag,
      score: 35 + (seed % 55),
      status: (35 + (seed % 55)) > 75 ? 'excellent' : (35 + (seed % 55)) > 50 ? 'good' : 'needs-work',
      details: [
        'Product descriptions need more detail',
        'Add customer reviews section',
        'Image quality varies across products',
        'Consider adding product videos',
      ],
    },
    {
      id: 'trust',
      label: 'Trust & Security',
      icon: Shield,
      score: 60 + (seed % 30),
      status: (60 + (seed % 30)) > 75 ? 'excellent' : (60 + (seed % 30)) > 50 ? 'good' : 'needs-work',
      details: [
        'SSL certificate detected',
        'Add trust badges to checkout',
        'Privacy policy needs updating',
        'Consider adding live chat support',
      ],
    },
  ];
};

const ANALYSIS_STEPS = [
  { text: 'Connecting to store...', icon: Globe },
  { text: 'Scanning pages...', icon: Search },
  { text: 'Analyzing performance...', icon: Zap },
  { text: 'Evaluating design...', icon: Palette },
  { text: 'Checking mobile experience...', icon: Smartphone },
  { text: 'Generating report...', icon: BarChart3 },
];

export default function StoreAnalysis() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeUrl = searchParams.get('url') || '';
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisCategory[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!storeUrl) {
      navigate('/onboarding');
      return;
    }

    // Simulate analysis progress
    const stepDuration = 800;
    const totalSteps = ANALYSIS_STEPS.length;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        setProgress(Math.min((next / totalSteps) * 100, 100));
        
        if (next >= totalSteps) {
          clearInterval(interval);
          setTimeout(() => {
            const results = generateAnalysis(storeUrl);
            setAnalysis(results);
            const avg = Math.round(results.reduce((sum, c) => sum + c.score, 0) / results.length);
            setOverallScore(avg);
            setIsAnalyzing(false);
          }, 500);
        }
        return next;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [storeUrl, navigate]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-500/10 border-green-500/20';
    if (score >= 50) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'good': return <Info className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const handleContinue = () => {
    localStorage.setItem('droop_onboarding_complete', 'true');
    localStorage.setItem('droop_store_context', JSON.stringify({ hasStore: true, storeUrl }));
    localStorage.setItem('droop_store_analysis', JSON.stringify({ analysis, overallScore, storeUrl }));
    navigate('/ai');
  };

  // Loading / Analyzing state
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
        <div className="max-w-md w-full text-center">
          <div className="relative mb-8">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl animate-pulse">
              <BarChart3 className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-foreground">Analyzing Your Store</h2>
          <p className="text-muted-foreground text-sm mb-2 truncate max-w-xs mx-auto">{storeUrl}</p>
          
          <div className="mt-8 mb-6">
            <Progress value={progress} className="h-2 rounded-full" />
            <p className="text-sm text-muted-foreground mt-3">
              {currentStep < ANALYSIS_STEPS.length ? ANALYSIS_STEPS[currentStep].text : 'Finalizing...'}
            </p>
          </div>

          <div className="space-y-2 mt-6">
            {ANALYSIS_STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isComplete = i < currentStep;
              const isCurrent = i === currentStep;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all',
                    isComplete && 'text-green-500',
                    isCurrent && 'text-primary font-medium',
                    !isComplete && !isCurrent && 'text-muted-foreground/50'
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <StepIcon className={cn('h-4 w-4 shrink-0', isCurrent && 'animate-pulse')} />
                  )}
                  <span>{s.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Results state
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Store Analysis</h1>
              <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">{storeUrl}</p>
            </div>
          </div>
          <Button onClick={handleContinue} className="gradient-button rounded-xl gap-2">
            Continue to AI <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Overall Score */}
        <div className="text-center mb-10">
          <div className={cn(
            'inline-flex items-center justify-center h-32 w-32 rounded-full border-4 mb-4',
            getScoreBg(overallScore)
          )}>
            <div>
              <span className={cn('text-4xl font-bold', getScoreColor(overallScore))}>{overallScore}</span>
              <span className="text-muted-foreground text-sm block">/100</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            {overallScore >= 75 ? 'Great job! 🎉' : overallScore >= 50 ? 'Good start! 💪' : 'Room for improvement 🚀'}
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {overallScore >= 75
              ? 'Your store is performing well. Let\'s fine-tune it for even better results.'
              : overallScore >= 50
              ? 'Your store has a solid foundation. Our AI can help you level up.'
              : 'Don\'t worry! Our AI assistant will help you improve every aspect of your store.'}
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {analysis.map((cat) => {
            const CatIcon = cat.icon;
            const isExpanded = expandedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                className={cn(
                  'text-left p-5 rounded-2xl border transition-all',
                  'bg-card hover:shadow-md',
                  isExpanded ? 'border-primary/30 shadow-md' : 'border-border/50'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', getScoreBg(cat.score))}>
                      <CatIcon className={cn('h-5 w-5', getScoreColor(cat.score))} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{cat.label}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        {getStatusIcon(cat.status)}
                        <span className="text-xs text-muted-foreground capitalize">{cat.status.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <span className={cn('text-2xl font-bold', getScoreColor(cat.score))}>{cat.score}</span>
                </div>

                <Progress value={cat.score} className="h-1.5 rounded-full mb-3" />

                {isExpanded && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    {cat.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 mt-0.5 shrink-0 text-primary/50" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <div className="inline-flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-bold text-foreground mb-1">Ready to improve your store?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI will use this analysis to give you personalized recommendations.
              </p>
              <Button onClick={handleContinue} className="gradient-button rounded-xl gap-2 px-8 h-12">
                Start with AI Assistant <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
