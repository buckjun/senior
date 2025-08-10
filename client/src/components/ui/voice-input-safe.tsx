import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Mic, MicOff, Square, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
        
        // Configure recognition
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.lang = 'ko-KR';
        recognition.current.maxAlternatives = 1;

        // Safe event handlers
        recognition.current.onstart = () => {
          try {
            console.log('Recognition started');
          } catch (error) {
            console.error('Error in onstart:', error);
          }
        };

        recognition.current.onresult = (event: any) => {
          try {
            let fullTranscript = '';
            
            if (event.results) {
              for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result && result[0] && result[0].transcript) {
                  fullTranscript += result[0].transcript;
                }
              }
            }
            
            console.log('Transcript:', fullTranscript);
            setTranscript(fullTranscript);
            
          } catch (error) {
            console.error('Error processing results:', error);
          }
        };

        recognition.current.onerror = (event: any) => {
          try {
            console.error('Recognition error:', event.error);
            setIsRecording(false);
          } catch (error) {
            console.error('Error in error handler:', error);
          }
        };

        recognition.current.onend = () => {
          try {
            console.log('Recognition ended');
            setIsRecording(false);
            
            // Restart recognition if still recording (for continuous mode)
            if (isRecording && recognition.current) {
              setTimeout(() => {
                try {
                  recognition.current.start();
                } catch (error) {
                  console.log('Recognition restart failed:', error);
                }
              }, 100);
            }
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
      setIsRecording(true);
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

  // Safe complete
  const handleComplete = () => {
    try {
      console.log('Completing with transcript:', transcript);
      
      stopRecording();
      
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
      
      handleClose();
      
    } catch (error) {
      console.error('Error completing:', error);
      handleClose();
    }
  };

  // Safe close
  const handleClose = () => {
    try {
      stopRecording();
      setTranscript('');
      onClose();
    } catch (error) {
      console.error('Error closing:', error);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="mobile-container max-w-sm mx-auto bottom-0 top-auto translate-y-0 rounded-t-3xl rounded-b-none border-0 p-6">
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
          
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="flex-1 btn-primary"
              disabled={!isSupported}
              data-testid="button-start-recording"
            >
              <Mic className="mr-2 h-5 w-5" />
              녹음 시작
            </Button>
          ) : (
            <div className="flex-1 flex space-x-2">
              <Button
                onClick={stopRecording}
                variant="outline"
                className="flex-1 py-4"
                data-testid="button-pause-recording"
              >
                <Square className="mr-2 h-4 w-4" />
                중지
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 btn-primary"
                data-testid="button-end-recording"
              >
                <Check className="mr-2 h-4 w-4" />
                종료
              </Button>
            </div>
          )}
        </div>

        {!isRecording && (
          <p className="text-sm text-gray-500 text-center mt-4">
            "15년간 매장관리 업무를 담당했습니다"와 같이 말씀해주세요
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}