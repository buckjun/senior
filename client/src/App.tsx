import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import IndividualSignup from "@/pages/individual/signup";
import IndividualProfileSetup from "@/pages/individual/profile-setup";
import IndividualProfileView from "@/pages/individual/profile-view";
import IndividualDashboard from "@/pages/individual/dashboard";
import JobCategorySelection from "@/pages/individual/job-category-selection";
import CompanyRecommendations from "@/pages/individual/company-recommendations";
import JobSearch from "@/pages/individual/job-search";
import SavedJobs from "@/pages/individual/saved-jobs";
import ManualInputPage from "@/pages/individual/manual-input";
import CompanySignup from "@/pages/company/signup";
import CompanyDashboard from "@/pages/company/dashboard";
import JobPosting from "@/pages/company/job-posting";
import AIRecommendations from "@/pages/company/ai-recommendations";
import ExcelUploadPage from "@/pages/admin/excel-upload";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [showSplash, setShowSplash] = useState(() => {
    // 세션에서 스플래시 표시 여부 확인
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    return !hasShownSplash;
  });

  // 스플래시 완료 핸들러
  const handleSplashComplete = () => {
    sessionStorage.setItem('hasShownSplash', 'true');
    setShowSplash(false);
  };



  // 스플래시 화면 표시 중이면 스플래시 화면만 보여주기
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // 스플래시 화면이 끝난 후 인증 로딩 중이면 간단한 로딩만 표시
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
          <Route path="/individual/signup" component={IndividualSignup} />
          <Route path="/company/signup" component={CompanySignup} />
        </>
      ) : (
        <>
          <Route path="/" component={Welcome} />
          <Route path="/individual/dashboard" component={IndividualDashboard} />
          <Route path="/individual/profile-setup" component={IndividualProfileSetup} />
          <Route path="/individual/profile-view" component={IndividualProfileView} />
          <Route path="/individual/manual-input" component={ManualInputPage} />
          <Route path="/individual/job-categories" component={JobCategorySelection} />
          <Route path="/individual/recommendations" component={CompanyRecommendations} />
          <Route path="/individual/search" component={JobSearch} />
          <Route path="/saved-jobs" component={SavedJobs} />
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
