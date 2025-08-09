import { useState } from "react";

export default function EducationRecommendation() {
  const educationPrograms = [
    {
      id: 1,
      category: '교육',
      title: '보험총무사무원 양성과정 1회차',
      description: '초보자도 가능한 보험사무 실무 첫걸음',
      image: '/placeholder-insurance.jpg',
      color: 'bg-blue-100'
    },
    {
      id: 2,
      category: '교육',
      title: '여성가족부지원 세무사무원 양성과정',
      description: '가족부 인증 프로그램, 믿고 배워요',
      image: '/placeholder-tax.jpg', 
      color: 'bg-white'
    },
    {
      id: 3,
      category: '교육',
      title: '처음 시작하는 아이패드 드로잉',
      description: '그림이 처음이어도 쉽게 시작해요',
      image: '/placeholder-ipad.jpg',
      color: 'bg-orange-100'
    },
    {
      id: 4,
      category: '교육',
      title: 'K-POP 드라마로 배우는 생활영어',
      description: '영어가 처음어도 쉽게 시작해요',
      image: '/placeholder-kpop.jpg',
      color: 'bg-red-100'
    }
  ];

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
      <div className="flex-1 px-6 py-6">
        
        {/* 헤더 텍스트 */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-sm mb-2">가입해주신 이숙자님을 위한 AI기반 추천</p>
          <h1 className="text-2xl font-bold text-black mb-1">
            숙자님에게 맞는
          </h1>
          <h1 className="text-2xl font-bold mb-4">
            <span className="text-red-500">교육</span>을 추천해드려요
          </h1>
        </div>

        {/* 교육 프로그램 목록 */}
        <div className="space-y-4 mb-6">
          {educationPrograms.map((program) => (
            <div
              key={program.id}
              className={`${program.color} rounded-2xl p-4 border border-gray-200`}
            >
              <div className="flex items-center gap-4">
                {/* 프로그램 이미지 */}
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {program.id === 1 && (
                    <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">보험</span>
                    </div>
                  )}
                  {program.id === 2 && (
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      </div>
                    </div>
                  )}
                  {program.id === 3 && (
                    <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl">🎨</span>
                    </div>
                  )}
                  {program.id === 4 && (
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">K-POP</span>
                    </div>
                  )}
                </div>

                {/* 프로그램 정보 */}
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">[{program.category}]</div>
                  <h3 className="font-bold text-gray-900 mb-1 leading-tight">
                    {program.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {program.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 더 보기 버튼 */}
        <button className="w-full bg-blue-500 text-white py-4 rounded-2xl text-lg font-medium">
          다른것도 보고싶어요
        </button>
      </div>
    </div>
  );
}