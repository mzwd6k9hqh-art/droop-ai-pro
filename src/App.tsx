import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import AIChat from "@/pages/AIChat";
import Pricing from "@/pages/Pricing";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
import StoreAnalysis from "@/pages/StoreAnalysis";
import Upgrade from "@/pages/Upgrade";
import VoiceCall from "@/pages/VoiceCall";
import CustomerChat from "@/pages/CustomerChat";
import Earnings from "@/pages/Earnings";

const queryClient = new QueryClient();

// Landing route wrapper - shows landing for unauthenticated users
function LandingRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Dashboard />;
  }
  
  return <Landing />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/store-analysis" element={<StoreAnalysis />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/ai" element={<AIChat />} />
                <Route path="/upgrade" element={<Upgrade />} />
                <Route path="/voice-call" element={<VoiceCall />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<LandingRoute />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/customers" element={<CustomerChat />} />
                  <Route path="/earnings" element={<Earnings />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
