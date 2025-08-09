import { useState } from "react";
import { useLocation } from "wouter";

export default function LoginSelection() {
  const [, setLocation] = useLocation();
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 입력 필드 영역 클릭 시 키보드 표시
    if (y > 360 && y < 500) {
      setShowKeyboard(true);
      return;
    }
    
    // 로그인 버튼 영역 클릭 시
    if (y > 515 && y < 570) {
      window.location.href = '/api/login';
      return;
    }
    
    // 회원가입 버튼 영역 클릭 시
    if (y > 605 && y < 635) {
      setLocation('/registration');
      return;
    }
    
    // 다른 영역 클릭 시 키보드 숨김
    setShowKeyboard(false);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* 메인 이미지 - 키보드 부분을 잘라낸 버전 */}
      <div 
        className="w-full h-full cursor-pointer relative"
        style={{ maxWidth: '393px', maxHeight: '852px' }}
        onClick={handleClick}
      >
        <img 
          src="/83-1531.png" 
          alt="로그인 선택 화면"
          className="w-full h-full object-cover"
          style={{ 
            clipPath: 'inset(0 0 250px 0)'
          }}
        />
        
        {/* 키보드 오버레이 - 입력 필드 클릭 시에만 표시 */}
        {showKeyboard && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-200 p-4 animate-slide-up">
            <div className="grid grid-cols-10 gap-1 mb-2">
              {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key) => (
                <button key={key} className="bg-white p-2 rounded text-center text-sm">
                  {key}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-9 gap-1 mb-2">
              {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((key) => (
                <button key={key} className="bg-white p-2 rounded text-center text-sm">
                  {key}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
                <button key={key} className="bg-white p-2 rounded text-center text-sm">
                  {key}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button className="bg-white p-2 rounded flex-1 text-sm">123</button>
              <button className="bg-white p-2 rounded flex-[3] text-sm">space</button>
              <button className="bg-blue-500 text-white p-2 rounded flex-1 text-sm">return</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}