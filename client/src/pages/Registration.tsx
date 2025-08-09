export default function Registration() {
  const handleClick = (e: React.MouseEvent) => {
    // 가입하기 버튼 영역 클릭 시
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 가입하기 버튼 영역 대략적 위치
    if (y > 925 && y < 980) {
      window.location.href = '/api/login';
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <img 
        src="/83-1550.png" 
        alt="회원가입 화면"
        className="w-full h-full object-cover cursor-pointer"
        style={{ maxWidth: '393px', maxHeight: '852px' }}
        onClick={handleClick}
      />
    </div>
  );
}