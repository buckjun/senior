import { Switch, Route, Router, useLocation } from "wouter";

// 간단한 페이지 컴포넌트들
function FramePage({ frameId, frameName, nextFrame }: { frameId: string, frameName: string, nextFrame?: string }) {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    if (nextFrame) {
      setLocation(`/${nextFrame}`);
    } else {
      // 마지막 페이지면 처음으로
      setLocation('/');
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
          src={`/${frameId}.png`}
          alt={frameName}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Switch>
        {/* 스플래시 화면 */}
        <Route path="/" component={() => <FramePage frameId="83-1499" frameName="스플래시" nextFrame="83-1531" />} />
        
        {/* 로그인 화면 */}
        <Route path="/83-1531" component={() => <FramePage frameId="83-1531" frameName="로그인" nextFrame="83-1550" />} />
        
        {/* 회원가입 화면 */}
        <Route path="/83-1550" component={() => <FramePage frameId="83-1550" frameName="회원가입" nextFrame="83-1576" />} />
        
        {/* 목적 선택 화면 */}
        <Route path="/83-1576" component={() => <FramePage frameId="83-1576" frameName="목적 선택" nextFrame="83-1874" />} />
        
        {/* 가입환영 화면 */}
        <Route path="/83-1874" component={() => <FramePage frameId="83-1874" frameName="가입환영" nextFrame="83-1842" />} />
        
        {/* AI 이력서 작성 화면 */}
        <Route path="/83-1842" component={() => <FramePage frameId="83-1842" frameName="AI 이력서 작성" nextFrame="83-1947" />} />
        
        {/* 일자리 게시판 화면 */}
        <Route path="/83-1947" component={() => <FramePage frameId="83-1947" frameName="일자리 게시판" nextFrame="83-1599" />} />
        
        {/* 교육 추천 화면 */}
        <Route path="/83-1599" component={() => <FramePage frameId="83-1599" frameName="교육 추천" nextFrame="83-1956" />} />
        
        {/* 기각 화면 */}
        <Route path="/83-1956" component={() => <FramePage frameId="83-1956" frameName="기각" />} />
        
        {/* 404 fallback */}
        <Route>
          <div className="w-full h-screen flex items-center justify-center bg-white">
            <div className="text-center">
              <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
              <button onClick={() => window.location.href = '/'} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                홈으로
              </button>
            </div>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;