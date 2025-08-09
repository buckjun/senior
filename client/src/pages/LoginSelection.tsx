import { useLocation } from "wouter";

export default function LoginSelection() {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    // 로그인 버튼 영역 클릭 시 실제 로그인으로 이동
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 로그인 버튼 영역 대략적 위치 (이미지 기준)
    if (y > 515 && y < 570) {
      window.location.href = '/api/login';
    }
    
    // 회원가입 버튼 영역 클릭 시
    if (y > 605 && y < 635) {
      setLocation('/registration');
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <img 
        src="/83-1531.png" 
        alt="로그인 선택 화면"
        className="w-full h-full object-cover cursor-pointer"
        style={{ maxWidth: '393px', maxHeight: '852px' }}
        onClick={handleClick}
      />
    </div>
  );
}