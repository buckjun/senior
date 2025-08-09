import { useLocation } from "wouter";

export default function Welcome() {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 계속하기 버튼 영역
    if (y > 700 && y < 800) {
      setLocation('/purpose-selection');
      return;
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div 
        className="w-full h-full cursor-pointer"
        style={{ maxWidth: '393px', maxHeight: '852px' }}
        onClick={handleClick}
      >
        <img 
          src="/83-1874.png" 
          alt="가입환영"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}