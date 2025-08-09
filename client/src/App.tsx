import { Switch, Route, Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Landing from "@/pages/Landing";
import LoginSelection from "@/pages/LoginSelection";
import Registration from "@/pages/Registration";
import PurposeSelection from "@/pages/PurposeSelection";
import JobBoard from "@/pages/JobBoard";
import Welcome from "@/pages/Welcome";
import AIResumeCreation from "@/pages/AIResumeCreation";
import EducationRecommendation from "@/pages/EducationRecommendation";
import Rejected from "@/pages/Rejected";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`Server error: ${res.status}`);
          }
          if (res.status >= 400) {
            const errorText = await res.text();
            throw new Error(`${res.status}: ${errorText}`);
          }
        }
        
        return res.json();
      },
    },
  },
});

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* 인증 불필요 - 로그인 전 페이지들 */}
      <Route path="/" component={isAuthenticated ? Welcome : Landing} />
      <Route path="/login" component={LoginSelection} />
      <Route path="/registration" component={Registration} />
      <Route path="/purpose-selection" component={PurposeSelection} />
      
      {/* 인증 필요 - 로그인 후 페이지들 */}
      <Route path="/welcome" component={Welcome} />
      <Route path="/ai-resume" component={AIResumeCreation} />
      <Route path="/education-recommendation" component={EducationRecommendation} />
      <Route path="/job-board" component={JobBoard} />
      <Route path="/rejected" component={Rejected} />
      
      {/* 404 fallback */}
      <Route>
        <div className="w-full h-screen flex items-center justify-center">
          <img src="/83-1956.png" alt="페이지를 찾을 수 없습니다" className="w-full h-full object-cover" style={{ maxWidth: '393px', maxHeight: '852px' }} />
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRouter />
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;