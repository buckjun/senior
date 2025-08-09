import { useLocation } from "wouter";

export default function JobBoard() {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 뒤로가기 버튼 영역
    if (y > 50 && y < 100) {
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
          src="/83-1947.png" 
          alt="일자리 게시판"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}