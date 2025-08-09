import { useLocation } from "wouter";

export default function LoginSelection() {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 로그인 버튼 영역 클릭 시 (이미지에서 "로그인" 버튼 위치)
    if (y > 520 && y < 570) {
      window.location.href = '/api/login';
      return;
    }
    
    // 회원가입 관련 링크 클릭 시 (이미지 하단의 "회원가입" 텍스트 영역)
    if (y > 595 && y < 625) {
      setLocation('/registration');
      return;
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div 
        className="w-full h-full cursor-pointer relative"
        style={{ maxWidth: '393px', maxHeight: '852px' }}
        onClick={handleClick}
      >
        {/* 원본 이미지를 그대로 사용 - 키보드 포함된 완전한 로그인 화면 */}
        <img 
          src="/83-1531.png" 
          alt="로그인 선택 화면"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}