import { useLocation } from "wouter";

export default function PurposeSelection() {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 첫 번째 버튼 영역 (일을 다시 시작하고 싶어요!)
    if (y > 650 && y < 720) {
      setLocation('/ai-resume');
      return;
    }
    
    // 두 번째 버튼 영역 (이제는 배우거나 즐기고 싶어요)
    if (y > 730 && y < 800) {
      setLocation('/education-recommendation');
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
          src="/83-1576.png" 
          alt="목적 선택 화면"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}