import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumePreview } from "@/components/ResumePreview";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Wand2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface ParsedResume {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  summary: string;
  skills: string[];
  experience: string[];
  education: string[];
}

interface AIResumeWriterProps {
  initialText?: string;
  onResumeGenerated?: (data: ParsedResume) => void;
  onProfileUpdated?: () => void;
}

export function AIResumeWriter({ initialText = "", onResumeGenerated, onProfileUpdated }: AIResumeWriterProps) {
  const [inputText, setInputText] = useState(initialText);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse resume mutation - now automatically updates profile on server
  const parseResumeMutation = useMutation({
    mutationFn: async (text: string): Promise<ParsedResume> => {
      const response = await apiRequest("POST", "/api/parse-resume", { text });
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      setParsedData(data);
      setIsProfileUpdated(true);
      onResumeGenerated?.(data);
      
      // Invalidate caches since profile was updated automatically on server
      queryClient.invalidateQueries({ queryKey: ['/api/individual-profiles/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/recommended'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      onProfileUpdated?.();
      
      toast({
        title: "이력서 생성 및 프로필 업데이트 완료! 🎉",
        description: "자연어에서 이력서 정보를 추출하고 내 정보에 자동 저장했습니다.",
      });

      // Navigate to dashboard
      setTimeout(() => {
        window.location.href = '/individual/dashboard';
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Resume parsing error:', error);
      toast({
        title: "분석 실패",
        description: error.message || "이력서 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleParseResume = () => {
    if (!inputText.trim()) {
      toast({
        title: "입력 필요",
        description: "자연어로 경력과 경험을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsProfileUpdated(false);
    parseResumeMutation.mutate(inputText);
  };

  const handleSampleText = () => {
    const sampleText = "안녕하십니까 한화이글스 투수 문동주입니다. 저는 10년간 투수로 활동했으며, 후에 탕후루가게를 창업해 5년간 운영했습니다.";
    setInputText(sampleText);
  };

  return (
    <div className="space-y-6">
      {/* 자연어 입력 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2F3036]">
            <Wand2 className="h-5 w-5 text-[#2F3036]" />
            자연어로 이력서 작성하기
          </CardTitle>
          <p className="text-sm text-[#2F3036]/70">
            평소 말하듯이 자연스럽게 경력과 경험을 설명해주세요. AI가 자동으로 이력서 형태로 정리하고 내 정보에 저장해드립니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="예시: 안녕하십니까. 저는 김영수입니다. 25년간 제조업에서 생산관리 업무를 담당했습니다..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              className="resize-none text-sm"
              data-testid="input-resume-text"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                💡 이름, 경력, 직책, 근무지, 보유 기술, 성과, 자격증 등을 자유롭게 말씀해주세요.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSampleText}
                className="text-xs"
              >
                예시 입력하기
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handleParseResume}
            disabled={parseResumeMutation.isPending || !inputText.trim()}
            className="w-full"
            size="lg"
            data-testid="button-generate-resume"
          >
            {parseResumeMutation.isPending ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                AI 분석 및 프로필 업데이트 중...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                이력서로 변환하고 내정보에 저장하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 분석 결과 및 성공 확인 */}
      {parsedData && (
        <Card className="border-[#2F3036]/20 bg-[#F5F5DC]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2F3036]">
              {isProfileUpdated ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {isProfileUpdated ? "완료! 내정보에 저장됨" : "AI 분석 결과"}
            </CardTitle>
            <p className="text-sm text-[#2F3036]/70">
              {isProfileUpdated 
                ? "아래 정보가 자동으로 내 정보에 저장되었습니다."
                : "자연어 입력에서 다음 정보를 추출했습니다."
              }
            </p>
          </CardHeader>
          <CardContent>
            <ResumePreview data={parsedData} />
            
            {isProfileUpdated && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800">프로필 업데이트 완료</p>
                    <p className="text-green-700 mt-1">
                      위 정보가 내 정보에 자동으로 저장되었습니다. 잠시 후 대시보드로 이동합니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}