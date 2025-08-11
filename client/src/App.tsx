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
import RecommendedCourses from "@/pages/individual/recommended-courses";
import CompanySignup from "@/pages/company/signup";
import CompanyDashboard from "@/pages/company/dashboard";
import JobPosting from "@/pages/company/job-posting";
import AIRecommendations from "@/pages/company/ai-recommendations";
import ExcelUploadPage from "@/pages/admin/excel-upload";
import AlgorithmVisualization from "@/pages/individual/algorithm-visualization";
import CourseDetail from "@/pages/individual/course-detail";
import VoiceToRecommendation from "@/pages/individual/voice-to-recommendation";
import SectorSelection from "@/pages/individual/sector-selection";
import UnifiedRecommendations from "@/pages/individual/unified-recommendations";
import SignupSuccessPage from "@/pages/signup-success";
import SignupInterestsPage from "@/pages/signup-interests";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();
  const [showSplash, setShowSplash] = useState(() => {
    // 개발 중에는 스플래시 스킵
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: skipping splash screen');
      return false;
    }
    // 세션에서 스플래시 표시 여부 확인
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    console.log('Splash screen check:', { hasShownSplash, willShow: !hasShownSplash });
    return !hasShownSplash;
  });

  // 스플래시 완료 핸들러
  const handleSplashComplete = () => {
    console.log('Splash screen completed');
    sessionStorage.setItem('hasShownSplash', 'true');
    setShowSplash(false);
  };

  // URL이 /dashboard인 경우 스플래시 스킵 (로그인 후 리다이렉트)
  useEffect(() => {
    if (location === '/dashboard') {
      sessionStorage.setItem('hasShownSplash', 'true');
      setShowSplash(false);
    }
  }, [location]);

  // 스플래시 화면 표시 중이면 스플래시 화면만 보여주기
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // 스플래시 화면이 끝난 후 인증 로딩 중이면 간단한 로딩만 표시
  if (isLoading) {
    console.log('App is loading authentication state');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-[#FFFEF0] to-white">
        <div className="w-12 h-12 border-4 border-[#F5F5DC] border-t-[#D4B896] rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-[#2F3036] mt-4">내일을 향한 새로운 출발</p>
      </div>
    );
  }

  console.log('App render state:', { isAuthenticated, isLoading, user: !!user, location, showSplash });

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Welcome} />
          <Route path="/signup/success" component={SignupSuccessPage} />
          <Route path="/signup/interests" component={SignupInterestsPage} />
        </>
      ) : (
        <>
          <Route path="/" component={IndividualDashboard} />
          <Route path="/dashboard" component={IndividualDashboard} />
          <Route path="/individual/signup" component={IndividualSignup} />
          <Route path="/individual/profile-setup" component={IndividualProfileSetup} />
          <Route path="/individual/profile-view" component={IndividualProfileView} />
          <Route path="/individual/manual-input" component={ManualInputPage} />
          <Route path="/individual/job-categories" component={JobCategorySelection} />
          <Route path="/individual/job-category-selection" component={JobCategorySelection} />
          <Route path="/individual/recommendations" component={CompanyRecommendations} />
          <Route path="/individual/company-recommendations" component={CompanyRecommendations} />
          <Route path="/individual/recommended-courses" component={RecommendedCourses} />
          <Route path="/individual/course-detail/:id" component={CourseDetail} />
          <Route path="/individual/dashboard" component={IndividualDashboard} />
          <Route path="/individual/algorithm-visualization" component={AlgorithmVisualization} />
          <Route path="/individual/search" component={JobSearch} />
          <Route path="/individual/voice-to-recommendation" component={VoiceToRecommendation} />
          <Route path="/individual/sector-selection" component={SectorSelection} />
          <Route path="/individual/unified-recommendations" component={UnifiedRecommendations} />
          <Route path="/saved-jobs" component={SavedJobs} />
          <Route path="/company/signup" component={CompanySignup} />
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
