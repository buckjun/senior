interface ProfileAvatarProps {
  gender: 'male' | 'female';
  ageGroup: 'young' | 'middle' | 'senior';
  className?: string;
}

export default function ProfileAvatar({ gender, ageGroup, className = "" }: ProfileAvatarProps) {
  // 성별과 연령대에 따른 간단한 아바타 이미지 선택
  const getAvatarImage = () => {
    if (gender === 'female') {
      return '/profile2.png'; // 여성 프로필
    } else {
      if (ageGroup === 'senior') {
        return '/profile1.png'; // 시니어 남성
      }
      return '/profile1.png'; // 기본 남성
    }
  };

  return (
    <div className={`rounded-full overflow-hidden ${className}`}>
      <img 
        src={getAvatarImage()}
        alt="프로필 아바타"
        className="w-full h-full object-cover"
        style={{ width: '48px', height: '48px' }}
      />
    </div>
  );
}