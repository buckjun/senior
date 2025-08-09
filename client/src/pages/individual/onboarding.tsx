
import { MobileLayout } from '@/components/layout/MobileLayout';
import { MobileButton } from '@/components/ui/mobile-card';
import { useLocation } from 'wouter';
import { ChevronRight } from 'lucide-react';

export default function Onboarding() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#FEF7E6' }}>
        {/* Progress Indicator */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: '#FF8B47' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="white">
              <path d="M20 4a16 16 0 1 0 16 16A16 16 0 0 0 20 4zm8 18h-6v6a2 2 0 0 1-4 0v-6h-6a2 2 0 0 1 0-4h6v-6a2 2 0 0 1 4 0v6h6a2 2 0 0 1 0 4z"/>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            프로필을 설정해주세요
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            더 정확한 일자리 추천을 위해<br/>
            기본 정보를 입력해주세요
          </p>

          <MobileButton
            fullWidth
            size="lg"
            onClick={() => setLocation('/individual/profile-setup')}
            className="mb-4"
            style={{ backgroundColor: '#FF8B47', color: 'white' }}
          >
            프로필 설정하기
            <ChevronRight className="w-5 h-5 ml-2" />
          </MobileButton>

          <button 
            onClick={() => setLocation('/individual/dashboard')}
            className="text-gray-500 underline"
          >
            나중에 하기
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
