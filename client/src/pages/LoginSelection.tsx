import { useLocation } from "wouter";

export default function LoginSelection() {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 로그인 버튼 영역 클릭 시
    if (y > 520 && y < 570) {
      window.location.href = '/api/login';
      return;
    }
    
    // 회원가입 링크 클릭 시
    if (y > 595 && y < 625) {
      setLocation('/registration');
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
          src="/83-1531.png" 
          alt="로그인 선택 화면"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}