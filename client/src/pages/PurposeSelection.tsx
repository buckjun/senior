import { useState } from "react";
import { useLocation } from "wouter";

export default function PurposeSelection() {
  const [, setLocation] = useLocation();
  const [selectedPurpose, setSelectedPurpose] = useState<string>('');

  const purposes = [
    {
      id: 'restart',
      text: '일을 다시 시작하고 싶어요 !',
      bgColor: 'bg-white',
      borderColor: 'border-green-200'
    },
    {
      id: 'learn',
      text: '이제는 배우거나 즐기고 싶어요',
      icon: '🎨',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200'
    }
  ];

  const handlePurposeSelect = (purposeId: string) => {
    setSelectedPurpose(purposeId);
    // 자동으로 다음 페이지로 이동
    setTimeout(() => {
      setLocation('/education-recommendation');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FEF7E6] flex flex-col">
      {/* 상태바 */}
      <div className="flex justify-between items-center px-6 py-2 text-black text-sm font-medium">
        <span>1:47</span>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-black rounded-full"></div>
            <div className="w-1 h-3 bg-black rounded-full"></div>
            <div className="w-1 h-3 bg-black rounded-full"></div>
            <div className="w-1 h-3 bg-black/50 rounded-full"></div>
          </div>
          <div className="w-6 h-3 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        
        {/* 프로필 이미지 */}
        <div className="w-32 h-32 rounded-full mb-6 overflow-hidden bg-gray-200 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-orange-200 to-orange-300 flex items-center justify-center">
            {/* 3D 캐릭터 스타일 얼굴 */}
            <div className="relative w-full h-full">
              {/* 머리카락 */}
              <div className="absolute top-2 left-2 right-2 h-12 bg-amber-900 rounded-t-full"></div>
              {/* 얼굴 */}
              <div className="absolute top-6 left-3 right-3 bottom-6 bg-orange-200 rounded-full flex items-center justify-center">
                {/* 눈 */}
                <div className="flex gap-2 mb-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
                {/* 입 */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-red-300 rounded-full"></div>
              </div>
              {/* 귀걸이 */}
              <div className="absolute top-10 left-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="absolute top-10 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 사용자 이름 */}
        <h2 className="text-2xl font-bold text-black mb-8">이숙자</h2>

        {/* 질문 텍스트 */}
        <div className="text-center mb-12">
          <p className="text-lg text-gray-700 mb-2">
            일있슈를 설치하게 된
          </p>
          <p className="text-lg text-gray-700">
            목적은 무엇인가요 ?
          </p>
        </div>

        {/* 선택 버튼들 */}
        <div className="w-full space-y-4">
          {purposes.map((purpose) => (
            <button
              key={purpose.id}
              onClick={() => handlePurposeSelect(purpose.id)}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                selectedPurpose === purpose.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : `${purpose.bgColor} ${purpose.borderColor}`
              }`}
            >
              <div className="flex items-center gap-3">
                {purpose.icon && (
                  <span className="text-2xl">{purpose.icon}</span>
                )}
                <span className="text-lg text-gray-800">{purpose.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}