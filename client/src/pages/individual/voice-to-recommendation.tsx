import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, MicOff, Loader2, Zap } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { VoiceRecognitionModal } from '@/components/VoiceRecognitionModal';
import { apiRequest } from '@/lib/queryClient';
import SectorSelection from './sector-selection';

interface ResumeAnalysisResult {
  profile: {
    years: number;
    education: string;
    skills: string[];
  };
  sectorGuess: Array<{ sector: string; score: number }>;
  sectors: string[];
  resumeText?: string;
}

export default function VoiceToRecommendation() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);

  // 음성 이력서 분석 mutation
  const analyzeResumeMutation = useMutation({
    mutationFn: async (resumeText: string): Promise<ResumeAnalysisResult> => {
      const response = await apiRequest('POST', '/api/resume-analysis', { resumeText });
      const result = await response.json();
      return result as ResumeAnalysisResult;
    },
    onSuccess: (data) => {
      console.log('Resume analysis result:', data);
      // 데이터 검증
      if (data && data.profile && data.sectorGuess && data.sectors) {
        setAnalysisResult(data);
        toast({
          title: "이력서 분석 완료! 🎉",
          description: `${data.sectorGuess.length}개 업종이 추천되었습니다.`,
        });
      } else {
        console.error('Invalid analysis result structure:', data);
        toast({
          title: "분석 실패",
          description: "서버에서 올바르지 않은 데이터를 반환했습니다.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "분석 실패",
        description: error.message || "이력서 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const handleVoiceResult = (transcript: string) => {
    if (transcript.trim()) {
      analyzeResumeMutation.mutate(transcript);
    }
  };

  // 분석 결과가 있으면 업종 선택 화면 표시
  if (analysisResult && analysisResult.profile && analysisResult.sectorGuess && analysisResult.sectors) {
    return (
      <SectorSelection 
        profile={analysisResult.profile}
        sectorGuess={analysisResult.sectorGuess}
        sectors={analysisResult.sectors}
        resumeText={analysisResult.resumeText || ''}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-white">
      {/* Header */}
      <header className="bg-white border-b border-[#2F3036]/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/dashboard')}
            className="flex items-center gap-2 text-[#2F3036] hover:bg-[#F5F5DC]"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드
          </Button>
          <h1 className="text-xl font-bold text-[#2F3036]">음성으로 맞춤 추천</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Hero Section */}
        <Card className="border-[#FF8C42]/30 bg-gradient-to-r from-[#FF8C42]/5 to-transparent">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#2F3036] flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-[#FF8C42]" />
              AI 음성 이력서 분석
            </CardTitle>
            <p className="text-[#2F3036]/70 mt-2">
              음성으로 경력을 말씀해주시면, AI가 분석하여 맞춤 직업과 교육을 추천해드립니다
            </p>
          </CardHeader>
        </Card>

        {/* Instructions */}
        <Card className="border-[#2F3036]/20">
          <CardHeader>
            <CardTitle className="text-[#2F3036]">사용 방법</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#F5F5DC]/30 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#FF8C42]/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎙️</span>
                </div>
                <h3 className="font-medium text-[#2F3036] mb-2">1. 음성 녹음</h3>
                <p className="text-sm text-[#2F3036]/70">
                  마이크 버튼을 눌러 경력과 경험을 자유롭게 말씀해주세요
                </p>
              </div>
              
              <div className="text-center p-4 bg-[#F5F5DC]/30 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#FF8C42]/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-medium text-[#2F3036] mb-2">2. AI 분석</h3>
                <p className="text-sm text-[#2F3036]/70">
                  AI가 음성을 분석하여 적합한 업종을 자동으로 추천해드립니다
                </p>
              </div>
              
              <div className="text-center p-4 bg-[#F5F5DC]/30 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#FF8C42]/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-medium text-[#2F3036] mb-2">3. 맞춤 추천</h3>
                <p className="text-sm text-[#2F3036]/70">
                  선택한 업종에 맞는 직업, 공고, 교육을 한 번에 추천받으세요
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Input Section */}
        <Card className="border-[#2F3036]/20">
          <CardHeader>
            <CardTitle className="text-[#2F3036]">음성 입력</CardTitle>
            <p className="text-[#2F3036]/70 text-sm">
              예시: "저는 대전에서 10년 동안 살았고, 한밭대학교를 졸업했습니다. 삼성화재에서 10년 동안 보험영업 일을 했습니다."
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Button
              onClick={() => setShowVoiceModal(true)}
              disabled={analyzeResumeMutation.isPending}
              className="w-40 h-40 rounded-full bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white shadow-lg hover:shadow-xl transition-all"
              data-testid="button-start-voice-recording"
            >
              {analyzeResumeMutation.isPending ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm">분석 중...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Mic className="w-8 h-8" />
                  <span className="text-sm font-medium">음성 입력</span>
                </div>
              )}
            </Button>
            
            <p className="text-[#2F3036]/70 max-w-md mx-auto">
              버튼을 클릭하여 음성 녹음을 시작하고, 자신의 경력과 경험을 자유롭게 말씀해주세요.
              AI가 자동으로 분석하여 가장 적합한 업종을 추천해드립니다.
            </p>
          </CardContent>
        </Card>

        {/* Voice Recognition Modal */}
        <VoiceRecognitionModal 
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onResult={handleVoiceResult}
          title="이력서 음성 입력"
          placeholder="경력과 경험을 자유롭게 말씀해주세요..."
          submitButtonText="분석하기"
        />
      </main>
    </div>
  );
}