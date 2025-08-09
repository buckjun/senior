import { useLocation } from "wouter";
import ProfileAvatar from "../components/ProfileAvatar";

export default function PurposeSelection() {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // 첫 번째 버튼 영역 (일을 다시 시작하고 싶어요!)
    if (y > 690 && y < 740) {
      setLocation('/education-recommendation');
    }
    
    // 두 번째 버튼 영역 (이제는 배우거나 즐기고 싶어요)
    if (y > 765 && y < 815) {
      setLocation('/education-recommendation');
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-white">
      <img 
        src="/83-1576.png" 
        alt="목적 선택 화면"
        className="w-full h-full object-cover cursor-pointer"
        style={{ maxWidth: '393px', maxHeight: '852px' }}
        onClick={handleClick}
      />
      
      {/* 프로필 이미지 오버레이 - 이미지 내 프로필 위치에 맞춰 배치 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-2/3">
        <ProfileAvatar 
          gender="female" 
          ageGroup="senior"
          className="shadow-lg"
        />
      </div>
    </div>
  );
}