import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Wand2, FileText, Sparkles, User, MapPin, Briefcase, BookOpen } from "lucide-react";

interface ParsedResumeData {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  summary: string;
  skills: string[];
}

interface AIResumeWriterProps {
  onResumeGenerated?: (data: ParsedResumeData) => void;
  onProfileUpdated?: () => void;
}

export function AIResumeWriter({ onResumeGenerated, onProfileUpdated }: AIResumeWriterProps) {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleParseResume = async () => {
    if (!inputText.trim()) {
      toast({
        title: "입력 필요",
        description: "자연어로 경력과 경험을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const data = await apiRequest("POST", "/api/parse-resume", {
        text: inputText
      });

      setParsedData(data);
      onResumeGenerated?.(data);
      
      toast({
        title: "AI 이력서 생성 완료",
        description: "자연어에서 이력서 정보를 성공적으로 추출했습니다.",
      });
    } catch (error: any) {
      console.error('Resume parsing error:', error);
      toast({
        title: "처리 실패",
        description: error.message || "이력서 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!parsedData) return;

    setIsUpdating(true);
    try {
      await apiRequest("POST", "/api/individual-profiles/ai-resume", {
        summary: parsedData.summary,
        skills: parsedData.skills,
        title: parsedData.title,
        location: parsedData.location,
        experience: [
          {
            title: parsedData.title,
            description: parsedData.summary,
            location: parsedData.location
          }
        ]
      });

      onProfileUpdated?.();
      
      toast({
        title: "프로필 업데이트 완료",
        description: "AI가 생성한 이력서 정보로 프로필이 업데이트되었습니다.",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "업데이트 실패",
        description: error.message || "프로필 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-blue-600" />
            AI 이력서 작성
          </CardTitle>
          <p className="text-sm text-gray-600">
            자연어로 경력과 경험을 설명해주세요. AI가 자동으로 구조화된 이력서를 생성합니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="예시: 저는 25년간 제조업에서 생산관리 업무를 담당했습니다. 삼성전자에서 15년, LG전자에서 10년 근무했으며, 품질관리와 공정개선에 전문성을 가지고 있습니다. 팀장으로 20명의 직원을 관리한 경험이 있고, ISO 9001 자격증을 보유하고 있습니다. 현재 경기도 수원에 거주하며, 연락처는 010-1234-5678입니다..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              className="resize-none"
              data-testid="input-resume-text"
            />
            <div className="mt-2 text-xs text-gray-500">
              💡 팁: 경력, 직책, 근무지, 보유 기술, 성과, 자격증 등을 자유롭게 설명해주세요.
            </div>
          </div>
          
          <Button 
            onClick={handleParseResume}
            disabled={isProcessing || !inputText.trim()}
            className="w-full"
            data-testid="button-generate-resume"
          >
            {isProcessing ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                AI가 이력서를 생성 중...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                AI 이력서 생성
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              생성된 이력서
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Info */}
            {(parsedData.name || parsedData.location || parsedData.phone || parsedData.email) && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  개인정보
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {parsedData.name && (
                    <div>
                      <span className="text-gray-600">이름:</span>
                      <span className="ml-2 font-medium">{parsedData.name}</span>
                    </div>
                  )}
                  {parsedData.location && (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-gray-600">지역:</span>
                      <span className="ml-2">{parsedData.location}</span>
                    </div>
                  )}
                  {parsedData.phone && (
                    <div>
                      <span className="text-gray-600">연락처:</span>
                      <span className="ml-2">{parsedData.phone}</span>
                    </div>
                  )}
                  {parsedData.email && (
                    <div>
                      <span className="text-gray-600">이메일:</span>
                      <span className="ml-2">{parsedData.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Title */}
            {parsedData.title && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  희망 직종
                </h3>
                <Badge variant="secondary" className="text-sm">
                  {parsedData.title}
                </Badge>
              </div>
            )}

            {/* Skills */}
            {parsedData.skills.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  추출된 기술/역량
                </h3>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {parsedData.summary && (
              <div className="space-y-2">
                <h3 className="font-semibold">자기소개서</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-line">
                  {parsedData.summary}
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button 
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="w-full"
              variant="default"
              data-testid="button-update-profile"
            >
              {isUpdating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  프로필 업데이트 중...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  내 프로필에 적용하기
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}