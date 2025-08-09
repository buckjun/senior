import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumePreview } from "@/components/ResumePreview";
import { VoiceInput } from "@/components/VoiceInput";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Wand2, Save, Sparkles, AlertCircle, Mic, Type } from "lucide-react";

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
  onResumeGenerated?: (data: ParsedResume) => void;
  onProfileUpdated?: () => void;
}

export function AIResumeWriter({ onResumeGenerated, onProfileUpdated }: AIResumeWriterProps) {
  const [inputText, setInputText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [voiceStatus, setVoiceStatus] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse resume mutation
  const parseResumeMutation = useMutation({
    mutationFn: async (text: string): Promise<ParsedResume> => {
      const response = await apiRequest("POST", "/api/parse-resume", { text });
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      setParsedData(data);
      onResumeGenerated?.(data);
      
      toast({
        title: "이력서 분석 완료! ✨",
        description: "자연어에서 이력서 정보를 성공적으로 추출했습니다.",
      });
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ParsedResume) => {
      const updateData: Record<string, any> = {};
      
      if (data.summary?.trim()) updateData.summary = data.summary.trim();
      if (data.skills?.length > 0) updateData.skills = data.skills.filter(skill => skill.trim());
      if (data.title?.trim()) updateData.title = data.title.trim();
      if (data.location?.trim()) updateData.location = data.location.trim();
      if (data.experience?.length > 0) updateData.experience = data.experience;
      if (data.education?.length > 0) updateData.education = data.education;

      return await apiRequest("POST", "/api/individual-profiles/ai-resume", updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/individual-profiles/me'] });
      onProfileUpdated?.();
      
      toast({
        title: "프로필 업데이트 완료! 🎉",
        description: "이제 맞춤 회사 추천을 받으실 수 있습니다.",
      });

      // Navigate to recommendations after profile update
      setTimeout(() => {
        window.location.href = '/individual/recommendations';
      }, 1500);
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast({
        title: "업데이트 실패",
        description: error.message || "프로필 업데이트 중 오류가 발생했습니다.",
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

    parseResumeMutation.mutate(inputText);
  };

  const handleUpdateProfile = () => {
    if (!parsedData) return;
    updateProfileMutation.mutate(parsedData);
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
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-blue-600" />
            자연어로 이력서 작성하기
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            평소 말하듯이 자연스럽게 경력과 경험을 설명해주세요. AI가 자동으로 이력서 형태로 정리해드립니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2" data-testid="tab-text">
                <Type className="w-4 h-4" />
                텍스트 입력
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2" data-testid="tab-voice">
                <Mic className="w-4 h-4" />
                음성 입력
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4 mt-4">
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
            </TabsContent>

            <TabsContent value="voice" className="space-y-4 mt-4">
              <VoiceInput
                onTranscript={(transcript) => {
                  // Append voice transcript to existing text (clean way)
                  const cleanTranscript = transcript.trim();
                  if (cleanTranscript) {
                    setInputText(prevText => {
                      const newText = prevText ? `${prevText} ${cleanTranscript}` : cleanTranscript;
                      return newText.trim();
                    });
                  }
                }}
                onStatusChange={setVoiceStatus}
                disabled={parseResumeMutation.isPending}
              />
              {inputText && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">현재 입력된 내용:</div>
                  <div className="text-sm">{inputText}</div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
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
                AI가 이력서를 분석 중입니다...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                AI 이력서 분석 시작
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 미리보기 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            이력서 미리보기
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            AI가 분석한 정보를 확인하고 내 프로필에 적용할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent>
          <ResumePreview data={parsedData || {
            name: "",
            title: "",
            location: "",
            phone: "",
            email: "",
            summary: "",
            skills: [],
            experience: [],
            education: []
          }} />
          
          {parsedData && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-start gap-3 mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">프로필 업데이트 확인</p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    위 정보로 내 프로필을 업데이트하시겠습니까? 기존 정보는 새로운 정보로 덮어쓰기됩니다.
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleUpdateProfile}
                disabled={updateProfileMutation.isPending}
                className="w-full"
                size="lg"
                data-testid="button-update-profile"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    프로필 업데이트 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    내 정보에 적용하기
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}