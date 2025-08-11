import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Mic, MicOff, Square, Check, Wand2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResumePreview } from '@/components/ResumePreview';

interface VoiceInputProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (transcript: string) => void;
  placeholder?: string;
}

export function VoiceInput({ isOpen, onClose, onTranscript, placeholder = "말씀해주세요..." }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [showConvertButton, setShowConvertButton] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedResult, setConvertedResult] = useState<any>(null);
  const recognition = useRef<any>(null);
  const { toast } = useToast();

  // Safe initialization
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      try {
        console.log('Initializing speech recognition...');
        
        // Check browser support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
          console.log('Speech recognition not supported');
          setIsSupported(false);
          return;
        }

        recognition.current = new SpeechRecognition();
        
        // Configure recognition - MDN recommended settings
        recognition.current.continuous = true;       // Keep listening until stop() is called
        recognition.current.interimResults = true;   // Show interim results
        recognition.current.lang = 'ko-KR';          // Korean language
        recognition.current.maxAlternatives = 1;     // Only return the best result

        // Safe event handlers
        recognition.current.onstart = () => {
          try {
            console.log('Recognition started');
            setIsRecording(true);
          } catch (error) {
            console.error('Error in onstart:', error);
          }
        };

        recognition.current.onresult = (event: any) => {
          try {
            // MDN recommended approach for building transcript
            let transcript = '';
            
            // Iterate through all results
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const result = event.results[i];
              if (result[0]) {
                transcript += result[0].transcript;
              }
            }
            
            // Update transcript state
            setTranscript(transcript);
            
          } catch (error) {
            console.error('Error processing results:', error);
          }
        };

        recognition.current.onerror = (event: any) => {
          try {
            console.error('Recognition error:', event.error);
            // Don't automatically stop on certain errors
            if (event.error === 'no-speech' || event.error === 'audio-capture') {
              console.log('Non-critical error, continuing...');
              return;
            }
            setIsRecording(false);
          } catch (error) {
            console.error('Error in error handler:', error);
          }
        };

        recognition.current.onend = () => {
          try {
            console.log('Recognition ended');
            setIsRecording(false);
            // Only restart if still supposed to be recording
            // This prevents auto-restart after manual stop
          } catch (error) {
            console.error('Error in onend:', error);
          }
        };

        console.log('Speech recognition initialized successfully');
        
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
        setIsSupported(false);
      }
    };

    initializeSpeechRecognition();

    return () => {
      try {
        if (recognition.current) {
          recognition.current.abort();
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };
  }, []);

  // Safe start recording
  const startRecording = () => {
    try {
      console.log('Attempting to start recording...');
      
      if (!isSupported || !recognition.current) {
        toast({
          title: "음성 인식 불가",
          description: "이 기기에서는 음성 인식을 사용할 수 없습니다.",
          variant: "destructive",
        });
        return;
      }

      setTranscript('');
      setShowConvertButton(false);
      recognition.current.start();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      toast({
        title: "녹음 시작 실패",
        description: "음성 녹음을 시작할 수 없습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // Safe stop recording
  const stopRecording = () => {
    try {
      console.log('Stopping recording...');
      
      if (recognition.current && isRecording) {
        recognition.current.stop();
      }
      setIsRecording(false);
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
    }
  };

  // Safe complete - now just stops recording and shows convert button
  const handleComplete = () => {
    try {
      console.log('Completing with transcript:', transcript);
      
      stopRecording();
      setShowConvertButton(true);
      
    } catch (error) {
      console.error('Error completing:', error);
      stopRecording();
    }
  };

  // Handle convert to resume
  const handleConvertToResume = async () => {
    if (!transcript.trim()) {
      toast({
        title: "입력 필요",
        description: "음성 녹음 내용이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    try {
      // Call the parse resume API
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcript.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert resume');
      }

      const result = await response.json();
      setConvertedResult(result);
      
      toast({
        title: "이력서 분석 완료! ✨",
        description: "자연어에서 이력서 정보를 성공적으로 추출했습니다.",
      });
    } catch (error) {
      console.error('Error converting resume:', error);
      toast({
        title: "분석 실패",
        description: "이력서 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  // Safe close
  const handleClose = () => {
    try {
      stopRecording();
      setTranscript('');
      setShowConvertButton(false);
      setConvertedResult(null);
      onClose();
    } catch (error) {
      console.error('Error closing:', error);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="mobile-container max-w-2xl mx-auto bottom-0 top-auto translate-y-0 rounded-t-3xl rounded-b-none border-0 p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>음성 입력</DialogTitle>
          <DialogDescription>음성으로 텍스트를 입력하세요.</DialogDescription>
        </DialogHeader>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
        
        <div className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full transition-colors ${
            isRecording ? 'bg-destructive animate-pulse' : 'bg-primary/10'
          }`}>
            {isRecording ? (
              <Mic className="text-white text-3xl" />
            ) : (
              <MicOff className="text-primary text-3xl" />
            )}
          </div>
          
          <h3 className="text-heading font-bold mb-2">
            {isRecording ? '음성 녹음 중...' : '음성으로 경력 입력'}
          </h3>
          <p className="text-gray-600">
            {isRecording ? '경력에 대해 자유롭게 말씀해주세요' : placeholder}
          </p>
        </div>

        {transcript && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-32 overflow-y-auto custom-scrollbar">
            <p className="text-gray-700 text-body leading-relaxed">
              {transcript}
            </p>
          </div>
        )}

        {!isSupported ? (
          <div className="text-center mb-4">
            <p className="text-red-500 text-sm">음성 인식이 지원되지 않는 기기입니다.</p>
          </div>
        ) : null}

        <div className="flex space-x-4">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1 py-4 text-body"
            data-testid="button-cancel-voice"
          >
            취소
          </Button>
          
          {!isRecording && !showConvertButton ? (
            <Button
              onClick={startRecording}
              className="flex-1 bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white"
              disabled={!isSupported}
              data-testid="button-start-recording"
            >
              <Mic className="mr-2 h-5 w-5" />
              녹음 시작
            </Button>
          ) : isRecording ? (
            <Button
              onClick={handleComplete}
              className="flex-1 bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white"
              data-testid="button-complete-recording"
            >
              <Check className="mr-2 h-4 w-4" />
              녹음 완료
            </Button>
          ) : showConvertButton ? (
            <Button
              onClick={handleConvertToResume}
              className="flex-1 bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white"
              disabled={isConverting}
              data-testid="button-convert-resume"
            >
              {isConverting ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  AI 분석 중...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  이력서로 변환하기
                </>
              )}
            </Button>
          ) : null}
        </div>

        {!isRecording && !showConvertButton && (
          <p className="text-sm text-gray-500 text-center mt-4">
            "15년간 매장관리 업무를 담당했습니다"와 같이 말씀해주세요
          </p>
        )}

        {/* Resume Conversion Result */}
        {convertedResult && (
          <div className="mt-6 border-t pt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="text-lg font-bold text-yellow-800 mb-2 flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                이력서 분석 완료!
              </h4>
              <p className="text-sm text-yellow-700">
                자연어에서 이력서 정보를 성공적으로 추출했습니다.
              </p>
            </div>
            <ResumePreview data={convertedResult} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}