import { useEffect } from "react";

export default function Landing() {
  // 3초 후 자동으로 로그인 페이지로 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/api/login';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FEF7E6] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* 상태바 영역 */}
      <div className="fixed top-0 left-0 right-0 h-11 bg-transparent z-10 flex justify-between items-center px-6 text-sm font-medium text-black">
        <span>1:47</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-black rounded-full"></div>
            <div className="w-1 h-3 bg-black rounded-full"></div>
            <div className="w-1 h-3 bg-black rounded-full"></div>
            <div className="w-1 h-3 bg-black/50 rounded-full"></div>
          </div>
          <div className="ml-1">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
              <path d="M2 3h14v6H2z" />
              <path d="M16 4h1v4h-1z" fill="currentColor" opacity="0.7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-sm w-full">
        
        {/* 메인 캐릭터 */}
        <div className="relative mb-12">
          {/* 파란색 별 장식 */}
          <div className="absolute -top-2 -right-2 w-8 h-8">
            <svg viewBox="0 0 24 24" fill="#87CEEB" className="w-full h-full">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>

          {/* 메인 캐릭터 */}
          <div className="relative">
            {/* 캐릭터 얼굴 */}
            <div className="w-32 h-32 bg-gradient-to-b from-[#FFD4A3] to-[#FFBE7D] rounded-full relative flex items-center justify-center shadow-lg">
              {/* 귀 */}
              <div className="absolute -left-3 top-8 w-8 h-10 bg-gradient-to-b from-[#FFD4A3] to-[#FFBE7D] rounded-full transform -rotate-12"></div>
              <div className="absolute -right-3 top-8 w-8 h-10 bg-gradient-to-b from-[#FFD4A3] to-[#FFBE7D] rounded-full transform rotate-12"></div>
              
              {/* 눈 */}
              <div className="flex gap-4 items-center">
                <div className="w-3 h-8 bg-black rounded-full"></div>
                <div className="w-3 h-8 bg-black rounded-full"></div>
              </div>
            </div>

            {/* 손 */}
            <div className="absolute -bottom-2 -left-4 w-8 h-8 bg-gradient-to-b from-[#FFD4A3] to-[#FFBE7D] rounded-full"></div>
            <div className="absolute -bottom-2 -right-4 w-8 h-8 bg-gradient-to-b from-[#FFD4A3] to-[#FFBE7D] rounded-full"></div>
          </div>

          {/* 카드 */}
          <div className="mt-4 w-24 h-20 bg-gradient-to-b from-[#FFF4A3] to-[#FFE066] rounded-2xl flex flex-col items-center justify-center shadow-lg">
            {/* 서류가방 아이콘 */}
            <div className="w-12 h-8 bg-gradient-to-b from-[#FF6B35] to-[#E55A2B] rounded-lg flex items-center justify-center relative">
              {/* 가방 손잡이 */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-2 border-2 border-[#FF6B35] rounded-t-lg bg-transparent"></div>
              {/* 체크 마크 */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
                <path d="M6 9.17L2.83 6l-1.41 1.41L6 12L14 4l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* 로고 텍스트 */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-[#FFCC66] tracking-wider" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            일있슈
          </h1>
        </div>
      </div>
    </div>
  );
}