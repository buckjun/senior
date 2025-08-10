import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mic, Upload, Camera, Edit } from 'lucide-react';
import { Link } from 'wouter';
import { VoiceInput } from '@/components/ui/voice-input-safe';
import { ObjectUploader } from '@/components/ObjectUploader';
import { AIResumeWriter } from '@/components/AIResumeWriter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { UploadResult } from '@uppy/core';

export default function IndividualProfileSetup() {
  const [location, setLocation] = useLocation();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isAIResumeModalOpen, setIsAIResumeModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    careerText: '',
    resumeFileUrl: ''
  });
  const { toast } = useToast();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const analyzeCareerMutation = useMutation({
    mutationFn: async (data: { careerText?: string; resumeText?: string }) => {
      return apiRequest('POST', '/api/ai/analyze-career', data);
    },
    onSuccess: (response) => {
      // Store AI analysis results
      localStorage.setItem('aiAnalysis', JSON.stringify(response));
      setLocation('/individual/recommendations');
    },
    onError: () => {
      toast({
        title: "분석 실패",
        description: "프로필 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const analyzeImageMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      const response = await apiRequest('POST', '/api/ai/analyze-resume-image', { base64Image });
      return await response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('aiAnalysis', JSON.stringify(data.analysis));
      toast({
        title: "분석 완료",
        description: "이력서 이미지가 성공적으로 분석되었습니다.",
      });
      setLocation('/individual/recommendations');
    },
    onError: () => {
      toast({
        title: "분석 실패",
        description: "이미지 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const processVoiceMutation = useMutation({
    mutationFn: async (transcript: string) => {
      const response = await apiRequest('POST', '/api/ai/process-voice', { transcript });
      return await response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('aiAnalysis', JSON.stringify(data.analysis));
      toast({
        title: "분석 완료",
        description: "음성 입력이 성공적으로 분석되었습니다.",
      });
      setLocation('/individual/recommendations');
    },
    onError: () => {
      toast({
        title: "분석 실패",
        description: "음성 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const handleVoiceTranscript = (transcript: string) => {
    processVoiceMutation.mutate(transcript);
  };

  const handleFileUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const fileUrl = uploadedFile.uploadURL;
      
      // Set ACL policy for the uploaded file
      apiRequest('PUT', '/api/resume-files', { resumeFileURL: fileUrl })
        .then(() => {
          toast({
            title: "업로드 완료",
            description: "이력서 파일이 성공적으로 업로드되었습니다.",
          });
          // Trigger AI analysis of the uploaded file
          // In a real implementation, this would extract text from the file
          analyzeCareerMutation.mutate({ resumeText: "업로드된 파일에서 추출된 텍스트" });
        })
        .catch(() => {
          toast({
            title: "업로드 실패",
            description: "파일 업로드 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        });
    }
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest('POST', '/api/objects/upload', {});
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        analyzeImageMutation.mutate(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkip = () => {
    setLocation('/individual/dashboard');
  };

  const handleBackButton = () => {
    // Navigate back to dashboard instead of previous page to avoid auth issues
    setLocation('/individual/dashboard');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-border sticky top-0 z-10 safe-area-top">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0" 
            onClick={handleBackButton}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="flex-1 text-heading font-bold text-center">프로필 생성</h2>
          <div className="w-10"></div>
        </div>
      </div>
      
      <div className="p-6 pb-8">
        {/* Profile Setup Options */}
        <div className="space-y-6">
          {/* AI Voice Input */}
          <div className="border-2 border-primary rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
                <Mic className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="text-body font-bold">음성 녹음</h3>
                <p className="text-gray-600">가장 쉬운 방법이에요</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsVoiceModalOpen(true)}
              className="w-full btn-primary"
              disabled={processVoiceMutation.isPending}
              data-testid="button-voice-input"
            >
              <Mic className="mr-2 h-5 w-5" />
              {processVoiceMutation.isPending ? '분석 중...' : '음성 녹음 시작'}
            </Button>
            <p className="text-sm text-gray-500 mt-2 text-center">
              "10년간 전자제품 매장에서 매니저로 일했습니다"
            </p>
          </div>
          
          {/* File Upload */}
          <div className="border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                <Upload className="text-gray-600 text-xl" />
              </div>
              <div>
                <h3 className="text-body font-bold">이력서 파일 업로드</h3>
                <p className="text-gray-600">기존 이력서가 있다면</p>
              </div>
            </div>
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760} // 10MB
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleFileUploadComplete}
              buttonClassName="w-full btn-ghost"
            >
              <Upload className="mr-2 h-5 w-5" />
              파일 선택 (PDF, DOC, HWP)
            </ObjectUploader>
          </div>
          
          {/* Camera Scan */}
          <div className="border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                <Camera className="text-gray-600 text-xl" />
              </div>
              <div>
                <h3 className="text-body font-bold">사진 스캔</h3>
                <p className="text-gray-600">종이 이력서를 촬영</p>
              </div>
            </div>
            <Button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full btn-ghost"
              disabled={analyzeImageMutation.isPending}
              data-testid="button-camera-scan"
            >
              <Camera className="mr-2 h-5 w-5" />
              {analyzeImageMutation.isPending ? '분석 중...' : '사진 스캔하기'}
            </Button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
          </div>
          
          {/* Natural Language AI Conversion */}
          <div className="border-2 border-blue-200 rounded-2xl p-6 bg-blue-50/50">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <Edit className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-body font-bold">텍스트 변환</h3>
                <p className="text-gray-600">평소 말하듯이 작성하면 AI가 변환</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsAIResumeModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-ai-resume-writer"
            >
              <Edit className="mr-2 h-5 w-5" />
              텍스트 변환 시작
            </Button>
            <p className="text-sm text-gray-500 mt-2 text-center">
              "저는 25년간 제조업에서 생산관리를..."
            </p>
          </div>

          {/* Manual Input */}
          <div className="border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                <Edit className="text-gray-600 text-xl" />
              </div>
              <div>
                <h3 className="text-body font-bold">직접 입력하기</h3>
                <p className="text-gray-600">양식에 맞춰 작성</p>
              </div>
            </div>
            <Link href="/individual/manual-input">
              <Button className="w-full btn-ghost" data-testid="button-manual-input">
                <Edit className="mr-2 h-5 w-5" />
                양식 작성하기
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Skip Option */}
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="w-full mt-8 text-gray-500 py-4 text-body underline"
          data-testid="button-skip-profile"
        >
          나중에 입력하기
        </Button>
      </div>

      {/* Voice Input Modal */}
      <VoiceInput
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscript={handleVoiceTranscript}
        placeholder="경력에 대해 자유롭게 말씀해주세요"
      />

      {/* AI Resume Writer Modal */}
      {isAIResumeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">AI 이력서 작성</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAIResumeModalOpen(false)}
              >
                닫기
              </Button>
            </div>
            <div className="p-6">
              <AIResumeWriter />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
