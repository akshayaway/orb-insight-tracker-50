import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SplashScreen } from "@/components/SplashScreen";
import { MobileLayout } from "@/components/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { initializeCapacitor } from "@/lib/capacitor";
import Index from "./pages/Index";
import Stats from "./pages/Stats";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PublicTrade from "./pages/PublicTrade";
import TradeReview from "./pages/TradeReview";
import TradeIdeasPage from "./pages/TradeIdeasPage";

// Configure React Query with caching for mobile performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// Desktop layout wrapper component
function DesktopLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
          <header className="h-12 flex items-center border-b border-border bg-card w-full px-4 gap-3">
            <SidebarTrigger className="ml-2" />
            <img 
              src="https://i.postimg.cc/W31cqNRN/20260117-155732.jpg" 
              alt="PropFirm" 
              className="h-8 w-8 rounded object-cover"
            />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-card-foreground truncate">
                PropFirm Knowledge Journal
              </h1>
            </div>
          </header>
          <main className="flex-1 p-4 w-full max-w-full overflow-x-hidden">
            <div className="w-full max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Main routes component
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/review/:tradeId" element={<TradeReview />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />
      <Route path="/ideas" element={<TradeIdeasPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Initialize Capacitor plugins on mount
  useEffect(() => {
    initializeCapacitor();
    
    // Hide splash after a short delay to allow auth check
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            {/* Splash Screen */}
            <SplashScreen isVisible={showSplash} />

            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/trade/:tradeId" element={<PublicTrade />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <DesktopLayout>
                      <AppRoutes />
                    </DesktopLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
