import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// 라이트 모드 기본 설정 (원본 디자인 기반)
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark');
}
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import Landing from "@/pages/Landing";
import IndividualSignup from "@/pages/individual/signup";
import IndividualProfileSetup from "@/pages/individual/profile-setup";
import IndividualProfileView from "@/pages/individual/profile-view";
import IndividualDashboard from "@/pages/individual/dashboard";
import JobCategorySelection from "@/pages/individual/job-category-selection";
import CompanyRecommendations from "@/pages/individual/company-recommendations";
import JobSearch from "@/pages/individual/job-search";
import SavedJobs from "@/pages/individual/saved-jobs";
import ManualInputPage from "@/pages/individual/manual-input";
import MobileDashboard from "@/pages/individual/mobile-dashboard";
import Onboarding from "@/pages/individual/onboarding";
import VoiceResume from "@/pages/individual/voice-resume";
import JobMatches from "@/pages/individual/job-matches";
import CompanySignup from "@/pages/company/signup";
import CompanyDashboard from "@/pages/company/dashboard";
import JobPosting from "@/pages/company/job-posting";
import AIRecommendations from "@/pages/company/ai-recommendations";
import ExcelUploadPage from "@/pages/admin/excel-upload";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={MobileDashboard} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/individual/signup" component={IndividualSignup} />
          <Route path="/individual/profile-setup" component={IndividualProfileSetup} />
          <Route path="/individual/profile-view" component={IndividualProfileView} />
          <Route path="/individual/manual-input" component={ManualInputPage} />
          <Route path="/individual/voice-resume" component={VoiceResume} />
          <Route path="/individual/job-categories" component={JobCategorySelection} />
          <Route path="/individual/recommendations" component={CompanyRecommendations} />
          <Route path="/individual/job-matches" component={JobMatches} />
          <Route path="/individual/dashboard" component={IndividualDashboard} />
          <Route path="/individual/search" component={JobSearch} />
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
        <div className="font-noto bg-background text-foreground overflow-x-hidden">
          <div className="max-w-sm mx-auto bg-background min-h-screen relative">
            <Toaster />
            <Router />
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
