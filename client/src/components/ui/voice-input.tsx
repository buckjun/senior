import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mic, MicOff, Square } from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "음성인식 불가",
        description: "이 브라우저는 음성인식을 지원하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition.current = new SpeechRecognition();
    
    recognition.current.continuous = true;
    recognition.current.interimResults = true;
    recognition.current.lang = 'ko-KR';

    recognition.current.onstart = () => {
      setIsListening(true);
    };

    recognition.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }

      setTranscript(prev => prev + finalTranscript + interimTranscript);
    };

    recognition.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsRecording(false);
      
      toast({
        title: "음성인식 오류",
        description: "음성인식 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    };

    recognition.current.onend = () => {
      setIsListening(false);
      if (isRecording) {
        // Restart recognition if still recording
        recognition.current.start();
      }
    };

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [isRecording, toast]);

  const startRecording = () => {
    if (!recognition.current) return;
    
    setTranscript('');
    setIsRecording(true);
    recognition.current.start();
  };

  const stopRecording = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
    setIsRecording(false);
    setIsListening(false);
  };

  const handleComplete = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      onClose();
      setTranscript('');
    }
  };

  const handleClose = () => {
    stopRecording();
    onClose();
    setTranscript('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="mobile-container max-w-sm mx-auto bottom-0 top-auto translate-y-0 rounded-t-3xl rounded-b-none border-0 p-6">
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
              data-testid="button-start-recording"
            >
              <Mic className="mr-2 h-5 w-5" />
              녹음 시작
            </Button>
          ) : (
            <div className="flex-1 flex space-x-2">
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex-1 py-4"
                data-testid="button-stop-recording"
              >
                <Square className="mr-2 h-4 w-4" />
                중지
              </Button>
              {transcript && (
                <Button
                  onClick={handleComplete}
                  className="flex-1 btn-primary"
                  data-testid="button-complete-voice"
                >
                  완료
                </Button>
              )}
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
