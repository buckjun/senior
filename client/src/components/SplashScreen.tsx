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
      {/* 상단 위젯 부분 제거됨 - 순수한 이미지만 표시 */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <img 
          src={splashImage} 
          alt="일이시 로고" 
          className="w-full h-full object-cover"
          style={{
            // 이미지에서 상단 상태바 부분을 자르기 위해 위쪽을 일부 잘라내기
            transform: 'translateY(-8%)',
            objectPosition: 'center bottom'
          }}
        />
      </div>
    </div>
  );
}