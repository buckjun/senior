import { useLocation } from "wouter";

export default function LoginSelection() {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    console.log('Login 페이지 클릭됨');
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    console.log('클릭 위치 Y:', y);
    
    // 로그인 버튼 영역 클릭 시
    if (y > 520 && y < 570) {
      console.log('로그인 버튼 클릭');
      window.location.href = '/api/login';
      return;
    }
    
    // 회원가입 링크 클릭 시
    if (y > 595 && y < 625) {
      console.log('회원가입 링크 클릭');
      setLocation('/registration');
      return;
    }
    
    // 임시: 전체 영역 클릭 시 로그인으로
    console.log('임시로 로그인 페이지로 이동');
    window.location.href = '/api/login';
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