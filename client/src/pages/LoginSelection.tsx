import { useState } from "react";

export default function LoginSelection() {
  const [activeTab, setActiveTab] = useState<'individual' | 'company'>('individual');

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
      <div className="flex-1 px-6 py-8">
        {/* 탭 메뉴 */}
        <div className="flex mb-8">
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex-1 pb-4 text-lg font-medium ${
              activeTab === 'individual'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            개인회원
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`flex-1 pb-4 text-lg font-medium ${
              activeTab === 'company'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            기업회원
          </button>
        </div>

        {/* 입력 폼 */}
        <div className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="아이디"
            className="w-full p-4 rounded-lg border border-gray-200 text-gray-500 placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full p-4 rounded-lg border border-gray-200 text-gray-500 placeholder-gray-400"
          />
        </div>

        {/* 로그인 버튼 */}
        <button
          onClick={() => window.location.href = '/api/login'}
          className="w-full bg-gray-800 text-white py-4 rounded-lg text-lg font-medium mb-6"
        >
          로그인
        </button>

        {/* 하단 링크들 */}
        <div className="flex justify-center space-x-8 text-gray-600 text-sm">
          <button onClick={() => window.location.href = '/registration'}>
            회원가입
          </button>
          <button>아이디 찾기</button>
          <button>비밀번호 찾기</button>
        </div>

        {/* 네이버 로그인 */}
        <div className="mt-8 flex justify-center">
          <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">N</span>
          </button>
        </div>
      </div>

      {/* 키보드 (디자인 요소) */}
      <div className="bg-gray-200 p-4">
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
    </div>
  );
}