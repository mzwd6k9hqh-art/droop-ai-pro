import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "@/pages/Landing";
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
                <Route path="/" element={<Landing />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/store-analysis" element={<StoreAnalysis />} />
                <Route path="/ai" element={<AIChat />} />
                <Route path="/upgrade" element={<Upgrade />} />
                <Route path="/voice-call" element={<VoiceCall />} />
                {/* Legacy auth routes redirect to onboarding */}
                <Route path="/login" element={<Navigate to="/onboarding" replace />} />
                <Route path="/register" element={<Navigate to="/onboarding" replace />} />
                <Route element={<AppLayout />}>
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
