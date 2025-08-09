import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, MicOff, Volume2 } from "lucide-react";

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (transcript: string) => void;
}

export function VoiceSearchModal({ isOpen, onClose, onTranscript }: VoiceSearchModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startListening = () => {
    setIsListening(true);
    // 음성 인식 시뮬레이션
    setTimeout(() => {
      const simulatedTranscript = "바리스타 일자리";
      setTranscript(simulatedTranscript);
      setIsListening(false);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const handleConfirm = () => {
    if (transcript) {
      onTranscript(transcript);
      setTranscript("");
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>음성 검색</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
            isListening ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
          }`}>
            {isListening ? (
              <MicOff className="w-12 h-12 text-red-500" />
            ) : (
              <Mic className="w-12 h-12 text-gray-500" />
            )}
          </div>
          
          <div className="text-center">
            {isListening ? (
              <p className="text-body text-gray-700">듣고 있습니다...</p>
            ) : transcript ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">인식된 내용:</p>
                <p className="text-body font-medium">{transcript}</p>
              </div>
            ) : (
              <p className="text-body text-gray-700">마이크 버튼을 눌러 말씀해주세요</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            {!isListening && !transcript && (
              <Button onClick={startListening} size="lg">
                <Mic className="w-5 h-5 mr-2" />
                음성 입력 시작
              </Button>
            )}
            
            {isListening && (
              <Button onClick={stopListening} variant="destructive" size="lg">
                <MicOff className="w-5 h-5 mr-2" />
                입력 중지
              </Button>
            )}
            
            {transcript && (
              <>
                <Button onClick={handleConfirm} size="lg">
                  검색하기
                </Button>
                <Button onClick={startListening} variant="outline" size="lg">
                  다시 입력
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}