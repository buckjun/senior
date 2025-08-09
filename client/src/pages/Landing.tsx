import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  // 3초 후 자동으로 로그인 선택 페이지로 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation('/login-selection');
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <img 
        src="/83-1499.png" 
        alt="일있슈 첫화면"
        className="w-full h-full object-cover"
        style={{ maxWidth: '393px', maxHeight: '852px' }}
      />
    </div>
  );
}