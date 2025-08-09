import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route, Router } from "wouter";

// Pixso 디자인 기반 새로운 페이지들
import Landing from "./pages/Landing";
import LoginSelection from "./pages/LoginSelection";
import Registration from "./pages/Registration";
import PurposeSelection from "./pages/PurposeSelection";
import EducationRecommendation from "./pages/EducationRecommendation";
import { useAuth } from "@/hooks/useAuth";

// Query client setup
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string);
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(`401: ${response.status} Unauthorized`);
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      },
    },
  },
});

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FEF7E6] flex items-center justify-center">
        <div className="animate-pulse text-[#FFCC66] text-2xl font-bold">일있슈</div>
      </div>
    );
  }

  return (
    <Switch>
      {/* 비로그인 사용자용 화면들 */}
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login-selection" component={LoginSelection} />
          <Route path="/registration" component={Registration} />
        </>
      ) : (
        <>
          {/* 로그인된 사용자용 화면들 */}
          <Route path="/" component={PurposeSelection} />
          <Route path="/purpose-selection" component={PurposeSelection} />
          <Route path="/education-recommendation" component={EducationRecommendation} />
        </>
      )}
      
      {/* 404 페이지 */}
      <Route>
        <div className="min-h-screen bg-[#FEF7E6] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-black text-[#FFCC66] mb-4">일있슈</div>
            <div className="text-gray-600">페이지를 찾을 수 없습니다</div>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="font-noto overflow-x-hidden">
          <div className="max-w-sm mx-auto min-h-screen relative">
            <Toaster />
            <Router>
              <AppRouter />
            </Router>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;