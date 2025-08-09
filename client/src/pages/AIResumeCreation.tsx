import { useLocation } from "wouter";

export default function AIResumeCreation() {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 뒤로가기 버튼
    if (y > 50 && y < 100) {
      setLocation('/purpose-selection');
      return;
    }
    
    // 계속하기 버튼 영역
    if (y > 700 && y < 800) {
      setLocation('/job-board');
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
          src="/83-1842.png" 
          alt="AI 이력서 작성"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}