import { MobileLayout } from '@/components/layout/MobileLayout';
import { MobileButton } from '@/components/ui/mobile-card';
import { useLocation } from 'wouter';
import { BrainCircuit, Sparkles, Users, Target } from 'lucide-react';

export default function Landing() {
  const [location, setLocation] = useLocation();

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <div className="flex-1 flex flex-col">
        {/* 히어로 섹션 */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 bg-gradient-to-br from-background via-muted/10 to-background">
          <div className="text-center space-y-8 max-w-sm">
            {/* 로고 및 아이콘 */}
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BrainCircuit className="w-12 h-12 text-primary" />
            </div>

            {/* 메인 제목 */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold" data-testid="text-app-title">
                일있슈
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                50-60대를 위한<br />
                <span className="text-primary font-semibold">AI 기반 맞춤형</span><br />
                일자리 추천 서비스
              </p>
            </div>

            {/* 특징 */}
            <div className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary mr-2" />
                <span>AI 음성 인식으로 간편한 이력서 작성</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Target className="w-4 h-4 text-primary mr-2" />
                <span>개인 맞춤형 일자리 및 회사 추천</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary mr-2" />
                <span>50-60대 전문 취업 지원</span>
              </div>
            </div>

            {/* CTA 버튼 */}
            <div className="space-y-4">
              <MobileButton 
                fullWidth 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium shadow-lg"
                testId="button-start"
              >
                지금 시작하기
              </MobileButton>
              <p className="text-xs text-muted-foreground px-4">
                로그인하면 개인 맞춤형 AI 분석과<br />
                전문적인 일자리 추천을 받으실 수 있습니다
              </p>
            </div>
          </div>
        </div>

        {/* 하단 브랜딩 */}
        <div className="p-6 text-center border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            © 2025 일있슈 - 경험이 자산이 되는 곳
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}