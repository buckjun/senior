import { useState } from "react";

// HTML에서 추출한 프레임 데이터 (실제 HTML PAGED_FRAMES 기준)
const FRAME_DATA = [
  { id: "83:1956", name: "기각" },
  { id: "83:1947", name: "일자리 게시판" },
  { id: "83:1938", name: "일자리 게시판" },
  { id: "83:1911", name: "일자리 게시판" },
  { id: "83:1884", name: "일자리 게시판" },
  { id: "83:1874", name: "1. 가입환영" },
  { id: "83:1842", name: "1. AI 이력서 작성" },
  { id: "83:1813", name: "1. AI 이력서 작성" },
  { id: "83:1778", name: "1. AI 이력서 작성" },
  { id: "83:1767", name: "2. 목적 선택" },
  { id: "83:1747", name: "2. 목적 선택" },
  { id: "83:1707", name: "메인화면" },
  { id: "83:1677", name: "2. 목적 선택" },
  { id: "83:1667", name: "2. AI 이력서 작성" },
  { id: "83:1633", name: "1. 분류1" },
  { id: "83:1599", name: "2. 분류1" },
  { id: "83:1576", name: "2. 목적 선택" },
  { id: "83:1550", name: "1. 회원가입" },
  { id: "83:1531", name: "1. 로그인" },
  { id: "83:1499", name: "1. 첫화면" }
];

function App() {
  const [selectedFrame, setSelectedFrame] = useState<string>("83:1499");
  
  const currentFrame = FRAME_DATA.find(f => f.id === selectedFrame);
  const pngFileName = selectedFrame.replace(":", "-");

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* 프레임 선택 버튼들 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">화면 선택</h1>
        <div className="grid grid-cols-4 gap-2 max-w-6xl">
          {FRAME_DATA.map((frame) => {
            const isSelected = frame.id === selectedFrame;
            return (
              <button
                key={frame.id}
                onClick={() => setSelectedFrame(frame.id)}
                className={`p-3 rounded text-sm font-medium transition-colors ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                <div className="truncate">{frame.name}</div>
                <div className="text-xs opacity-70">{frame.id}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 프레임 표시 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          현재 화면: {currentFrame?.name} ({selectedFrame})
        </h2>
        
        <div className="flex justify-center">
          <div className="max-w-md">
            <img 
              src={`/${pngFileName}.png`}
              alt={currentFrame?.name || "프레임"}
              className="w-full h-auto border border-gray-200 rounded-lg shadow-sm"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = '/placeholder.png';
                img.alt = '이미지를 찾을 수 없습니다';
              }}
            />
          </div>
        </div>
        
        {/* 프레임 정보 */}
        <div className="mt-4 text-center text-gray-600">
          <p>파일명: {pngFileName}.png</p>
          <p>프레임 ID: {selectedFrame}</p>
        </div>
      </div>
    </div>
  );
}

export default App;