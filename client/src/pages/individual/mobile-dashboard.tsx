import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { MobileCard, MobileButton } from '@/components/ui/mobile-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { AIResumeWriter } from '@/components/AIResumeWriter';
import { BookmarkIcon, BrainCircuit, Building2, Search, User, Zap } from 'lucide-react';

export default function MobileDashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [parsedResumeData, setParsedResumeData] = useState(null);

  // 사용자 프로필 정보
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/individual-profiles/me'],
    enabled: !!user,
  });

  // 추천 구인공고
  const { data: recommendedJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/jobs/recommended'],
    enabled: !!user,
  });

  // 회사 추천 정보
  const { data: companyRecommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/recommendations'],
    enabled: !!user,
  });

  const handleProfileSetup = () => {
    setLocation('/individual/profile-setup');
  };

  const handleJobCategories = () => {
    setLocation('/individual/job-categories');
  };

  const handleViewRecommendations = () => {
    setLocation('/individual/company-recommendations');
  };

  if (!user) {
    return (
      <MobileLayout showHeader={false} showBottomNav={false}>
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-6">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <BrainCircuit className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">일있슈</h1>
              <p className="text-muted-foreground text-sm">
                50-60대를 위한 AI 기반<br />
                맞춤형 일자리 추천 서비스
              </p>
            </div>
            <div className="space-y-3">
              <MobileButton 
                fullWidth 
                onClick={() => setLocation('/api/login')}
                testId="button-login"
              >
                시작하기
              </MobileButton>
              <p className="text-xs text-muted-foreground">
                AI가 당신에게 맞는 일자리를 찾아드립니다
              </p>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="홈" showHeader={true} showBottomNav={true}>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* 환영 카드 */}
        <MobileCard variant="filled" className="bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1" data-testid="text-welcome">
                안녕하세요, {(user as any).firstName || '회원'}님
              </h2>
              <p className="text-sm text-muted-foreground">
                맞춤형 일자리를 찾아보세요
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          </div>
        </MobileCard>

        {/* 프로필 완성도 */}
        {profile && (
          <MobileCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">프로필 완성도</h3>
              <span className="text-sm text-muted-foreground">
                {profile.profileCompleteness || 0}%
              </span>
            </div>
            <Progress value={profile.profileCompleteness || 0} className="mb-3" />
            <MobileButton 
              size="sm" 
              variant="secondary"
              onClick={() => setLocation('/individual/profile-view')}
              testId="button-complete-profile"
            >
              프로필 완성하기
            </MobileButton>
          </MobileCard>
        )}

        {/* AI 이력서 작성 */}
        <MobileCard>
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <BrainCircuit className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">AI 이력서 작성</h3>
              <p className="text-sm text-muted-foreground">음성으로 간편하게 작성</p>
            </div>
          </div>
          <AIResumeWriter 
            onResumeGenerated={(data) => setParsedResumeData(data)}
            onProfileUpdated={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/individual-profiles/me'] });
              queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
              queryClient.invalidateQueries({ queryKey: ['/api/jobs/recommended'] });
              toast({
                title: "프로필 업데이트 완료",
                description: "AI 분석 결과가 내 정보에 적용되었습니다.",
              });
            }}
          />
        </MobileCard>

        {/* 빠른 액션 버튼들 */}
        <div className="grid grid-cols-2 gap-3">
          <MobileCard 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleJobCategories}
          >
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Search className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-medium text-sm">관심 분야 선택</h4>
              <p className="text-xs text-muted-foreground mt-1">원하는 직종 찾기</p>
            </div>
          </MobileCard>

          <MobileCard 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setLocation('/individual/saved-jobs')}
          >
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <BookmarkIcon className="w-6 h-6 text-green-500" />
              </div>
              <h4 className="font-medium text-sm">찜한 공고</h4>
              <p className="text-xs text-muted-foreground mt-1">관심 있는 일자리</p>
            </div>
          </MobileCard>
        </div>

        {/* 추천 회사 미리보기 */}
        {companyRecommendations?.recommendations?.length > 0 && (
          <MobileCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">맞춤 회사 추천</h3>
              <MobileButton 
                size="sm" 
                variant="ghost"
                onClick={handleViewRecommendations}
                testId="button-view-all-recommendations"
              >
                전체보기
              </MobileButton>
            </div>
            <div className="space-y-2">
              {companyRecommendations.recommendations.slice(0, 2).map((company: any) => (
                <div 
                  key={company.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{company.companyName}</h4>
                      <p className="text-xs text-muted-foreground">{company.jobTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-primary font-medium">
                      {Math.round(company.matchingScore)}% 매칭
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MobileCard>
        )}

        {/* 빈 공간 */}
        <div className="h-16"></div>
      </div>
    </MobileLayout>
  );
}