interface ProfileAvatarProps {
  gender: 'male' | 'female';
  ageGroup: 'young' | 'middle' | 'senior';
  className?: string;
}

export default function ProfileAvatar({ gender, ageGroup, className = "" }: ProfileAvatarProps) {
  // 성별과 연령대에 따른 아바타 선택
  const getAvatarStyle = () => {
    if (gender === 'female') {
      if (ageGroup === 'young' || ageGroup === 'middle') {
        // 우상단 - 젊은 여성 (노란 옷)
        return {
          backgroundImage: 'url(/profile-avatars.png)',
          backgroundPosition: '50% 0%',
          backgroundSize: '200% 200%'
        };
      } else {
        // 중년 여성 스타일로 수정 필요 시
        return {
          backgroundImage: 'url(/profile-avatars.png)',
          backgroundPosition: '50% 0%',
          backgroundSize: '200% 200%'
        };
      }
    } else {
      if (ageGroup === 'young') {
        // 좌상단 - 젊은 남성 (안경, 정장)
        return {
          backgroundImage: 'url(/profile-avatars.png)',
          backgroundPosition: '0% 0%',
          backgroundSize: '200% 200%'
        };
      } else if (ageGroup === 'middle') {
        // 우하단 - 중년 남성 (선글라스, 오렌지 옷)
        return {
          backgroundImage: 'url(/profile-avatars.png)',
          backgroundPosition: '50% 50%',
          backgroundSize: '200% 200%'
        };
      } else {
        // 좌하단 - 시니어 남성 (모자, 수염)
        return {
          backgroundImage: 'url(/profile-avatars.png)',
          backgroundPosition: '0% 50%',
          backgroundSize: '200% 200%'
        };
      }
    }
  };

  return (
    <div 
      className={`w-32 h-32 rounded-full ${className}`}
      style={getAvatarStyle()}
    />
  );
}