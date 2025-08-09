export default function EducationRecommendation() {
  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 다른것도 보고싶어요 버튼 클릭 시
    if (y > 915 && y < 965) {
      // 추가 교육 추천 또는 다른 페이지로 이동
      console.log('다른것도 보고싶어요 버튼 클릭');
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <img 
        src="/83-1599.png" 
        alt="교육 추천 화면"
        className="w-full h-full object-cover cursor-pointer"
        style={{ maxWidth: '393px', maxHeight: '852px' }}
        onClick={handleClick}
      />
    </div>
  );
}