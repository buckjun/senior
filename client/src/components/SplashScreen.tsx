import { useEffect, useState } from "react";
import splashImage from "../assets/splash-screen.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // 페이드아웃 애니메이션 후 완료
    }, 2000); // 2초 동안 스플래시 화면 표시

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFEF0 49.04%, #FFFFFF 100%)'
      }}
    >
      {/* 원본 이미지 그대로 사용 */}
      <div className="w-full h-full flex items-center justify-center">
        <img 
          src={splashImage} 
          alt="일이시 로고" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}