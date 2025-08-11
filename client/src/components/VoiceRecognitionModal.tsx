import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Mic, MicOff, Square, Play, Loader2 } from "lucide-react";

interface VoiceRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (transcript: string) => void;
  title?: string;
  placeholder?: string;
  submitButtonText?: string;
}

export function VoiceRecognitionModal({
  isOpen,
  onClose,
  onResult,
  title = "음성 인식",
  placeholder = "음성 인식 결과가 여기에 표시됩니다...",
  submitButtonText = "완료"
}: VoiceRecognitionModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ko-KR';

      recognitionRef.current.onstart = () => {
        console.log('Recognition started');
        setIsRecording(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Recognition ended');
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      console.log('Attempting to start recording...');
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      console.log('Stopping recording...');
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onResult(transcript);
      onClose();
      setTranscript("");
    }
  };

  const handleModalClose = () => {
    if (isRecording) {
      stopRecording();
    }
    onClose();
    setTranscript("");
  };

  if (!isSupported) {
    return (
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>음성 인식 지원 안됨</DialogTitle>
            <DialogDescription>
              현재 브라우저에서 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-[#FF8C42]" />
            {title}
          </DialogTitle>
          <DialogDescription>
            마이크 버튼을 클릭하여 음성 입력을 시작하세요. 말씀하신 내용이 자동으로 텍스트로 변환됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recording Control */}
          <div className="flex justify-center">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-[#FF8C42] hover:bg-[#FF8C42]/90'
              } text-white`}
              data-testid="button-voice-record"
            >
              {isRecording ? (
                <Square className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
          </div>

          {/* Status */}
          <div className="text-center">
            {isRecording ? (
              <div className="flex items-center justify-center gap-2 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>녹음 중...</span>
              </div>
            ) : (
              <span className="text-[#2F3036]/70">
                {transcript ? "녹음이 완료되었습니다" : "마이크 버튼을 클릭하여 시작하세요"}
              </span>
            )}
          </div>

          {/* Transcript Display */}
          <Card className="border-[#2F3036]/20">
            <CardHeader>
              <CardTitle className="text-sm text-[#2F3036]">음성 인식 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-32 p-4 bg-[#F5F5DC]/20 rounded-lg border border-[#2F3036]/10">
                {transcript ? (
                  <p className="text-[#2F3036] whitespace-pre-wrap">{transcript}</p>
                ) : (
                  <p className="text-[#2F3036]/50 italic">{placeholder}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={handleModalClose}
              className="border-[#2F3036]/20 text-[#2F3036]"
              data-testid="button-voice-cancel"
            >
              취소
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!transcript.trim()}
              className="bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white"
              data-testid="button-voice-submit"
            >
              {submitButtonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}