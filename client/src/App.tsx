import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";
import { useState } from "react";

// Pages
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import CompanySignup from "@/pages/company/signup";
import CompanyDashboard from "@/pages/company/dashboard";
import JobPosting from "@/pages/company/job-posting";
import AIRecommendations from "@/pages/company/ai-recommendations";
import ExcelUploadPage from "@/pages/admin/excel-upload";
import IndividualSignup from "@/pages/individual/signup";
import IndividualDashboard from "@/pages/individual/dashboard";
import IndividualProfileSetup from "@/pages/individual/profile-setup";
import UserDashboard from "@/pages/user-dashboard";
import ProfileSelection from "@/pages/profile-selection";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(() => {
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    return !hasShownSplash;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasShownSplash', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Welcome} />
          <Route path="/company/signup" component={CompanySignup} />
          <Route path="/individual/signup" component={IndividualSignup} />
        </>
      ) : (
        <>
          <Route path="/" component={UserDashboard} />
          <Route path="/profile-selection" component={ProfileSelection} />
          <Route path="/individual/dashboard" component={IndividualDashboard} />
          <Route path="/individual/profile-setup" component={IndividualProfileSetup} />
          <Route path="/company/dashboard" component={CompanyDashboard} />
          <Route path="/company/job-posting" component={JobPosting} />
          <Route path="/company/ai-recommendations" component={AIRecommendations} />
          <Route path="/admin/excel-upload" component={ExcelUploadPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="font-noto bg-background text-textPrimary overflow-x-hidden">
          <div className="max-w-sm mx-auto bg-white min-h-screen relative">
            <Toaster />
            <Router />
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;