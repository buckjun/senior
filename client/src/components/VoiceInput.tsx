import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

// Web Speech API types
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onspeechend: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onStatusChange?: (status: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, onStatusChange, disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('음성 인식 준비됨');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      
      // Configure recognition
      recognition.lang = 'ko-KR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setStatus('음성 인식 중...');
        onStatusChange?.('음성 인식 중...');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        if (fullTranscript.trim()) {
          setTranscript(fullTranscript);
          
          if (finalTranscript) {
            onTranscript(finalTranscript);
            const confidence = event.results[event.results.length - 1][0].confidence || 0;
            setStatus(`음성 인식 완료 (신뢰도: ${Math.round(confidence * 100)}%)`);
            onStatusChange?.(`음성 인식 완료 (신뢰도: ${Math.round(confidence * 100)}%)`);
          }
        }
      };

      recognition.onspeechend = () => {
        recognition.stop();
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatus('음성 인식 종료');
        onStatusChange?.('음성 인식 종료');
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        const errorMessage = getErrorMessage(event.error);
        
        // Don't show error for aborted (often user-initiated)
        if (event.error !== 'aborted') {
          setStatus(`오류: ${errorMessage}`);
          onStatusChange?.(`오류: ${errorMessage}`);
        } else {
          setStatus('음성 인식 중단됨');
          onStatusChange?.('음성 인식 중단됨');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setStatus('브라우저가 음성 인식을 지원하지 않습니다');
      onStatusChange?.('브라우저가 음성 인식을 지원하지 않습니다');
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.abort(); // Use abort for cleaner cleanup
      }
    };
  }, [onTranscript, onStatusChange]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'no-speech':
        return '음성이 감지되지 않았습니다';
      case 'audio-capture':
        return '마이크에 접근할 수 없습니다';
      case 'not-allowed':
        return '마이크 권한이 필요합니다';
      case 'network':
        return '네트워크 오류가 발생했습니다';
      case 'language-not-supported':
        return '한국어가 지원되지 않습니다';
      case 'service-not-allowed':
        return '음성 인식 서비스를 사용할 수 없습니다';
      default:
        return error;
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current || isListening || disabled) return;
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      recognitionRef.current.start();
    } catch (error) {
      console.error('Microphone permission or start error:', error);
      setStatus('마이크 권한이 필요합니다');
      onStatusChange?.('마이크 권한이 필요합니다');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    
    recognitionRef.current.stop();
    setIsListening(false);
  };

  if (!isSupported) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
        <VolumeX className="w-4 h-4 text-gray-400" />
        <span className="text-caption text-gray-500">음성 인식이 지원되지 않습니다</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {isListening ? (
          <Button
            onClick={stopListening}
            size="sm"
            variant="destructive"
            disabled={disabled}
            data-testid="button-stop-voice"
          >
            <MicOff className="w-4 h-4 mr-1" />
            녹음 중지
          </Button>
        ) : (
          <Button
            onClick={startListening}
            size="sm"
            disabled={disabled}
            data-testid="button-start-voice"
          >
            <Mic className="w-4 h-4 mr-1" />
            음성 인식 시작
          </Button>
        )}

        <Badge 
          variant={isListening ? "default" : "secondary"}
          className={`text-xs ${isListening ? 'status-badge status-info' : 'status-badge status-secondary'}`}
        >
          {status}
        </Badge>
      </div>

      {transcript && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border">
          <div className="text-caption text-blue-600 dark:text-blue-400 mb-1">인식된 텍스트:</div>
          <div className="text-body font-medium text-blue-800 dark:text-blue-200">
            {transcript}
          </div>
        </div>
      )}
    </div>
  );
}