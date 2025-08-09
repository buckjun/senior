
import { MobileLayout } from '@/components/layout/MobileLayout';
import { MobileButton } from '@/components/ui/mobile-card';
import { useLocation } from 'wouter';
import { Mic, MicOff, Play, Square, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function VoiceResume() {
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#FEF7E6' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-orange-200">
          <button onClick={() => setLocation('/individual/dashboard')}>
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">AI 이력서 작성</h1>
          <div className="w-6"></div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 text-center">
          {/* Microphone Icon */}
          <div className="relative mb-8">
            <div 
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording ? 'bg-red-100 scale-110' : 'bg-orange-100'
              }`}
            >
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  isRecording ? 'bg-red-500' : 'bg-orange-400'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
            
            {isRecording && (
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {isRecording ? '녹음 중...' : '음성으로 이력서를 작성해보세요'}
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed text-sm">
            💡 이름, 경력, 직책, 근무지, 보유 기술,<br/>
            성과, 자격증 등을 자유롭게 말씀해주세요
          </p>

          {/* Example Text */}
          <div className="bg-white rounded-lg p-4 mb-8 border border-orange-200">
            <p className="text-sm text-gray-600 text-left">
              <span className="font-semibold text-orange-600">예시:</span><br/>
              "안녕하세요, 저는 김철수입니다. 20년간 제조업에서 생산관리 업무를 담당했고, 
              현재는 새로운 기회를 찾고 있습니다. 품질관리 자격증을 보유하고 있으며..."
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-4 w-full">
            <MobileButton
              fullWidth
              size="lg"
              onClick={() => {
                setIsRecording(!isRecording);
                if (!isRecording) {
                  // Start recording timer
                  const timer = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                  }, 1000);
                } else {
                  setRecordingTime(0);
                }
              }}
              className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-400 hover:bg-orange-500'}
              style={{ color: 'white' }}
            >
              {isRecording ? (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  녹음 중지
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  녹음 시작
                </>
              )}
            </MobileButton>

            {!isRecording && (
              <MobileButton
                fullWidth
                variant="outline"
                onClick={() => setLocation('/individual/manual-input')}
                className="border-orange-400 text-orange-600"
              >
                직접 입력하기
              </MobileButton>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
