import { useLocation } from "wouter";

export default function Rejected() {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 돌아가기 버튼 영역
    if (y > 700 && y < 800) {
      setLocation('/');
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
          src="/83-1956.png" 
          alt="기각"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}