import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function IndividualSignup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const { toast } = useToast();

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/profiles', data);
    },
    onSuccess: () => {
      setLocation('/individual/profile-setup');
    },
    onError: (error) => {
      toast({
        title: "가입 실패",
        description: "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAgreed) {
      toast({
        title: "약관 동의 필요",
        description: "이용약관과 개인정보 처리방침에 동의해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }
    
    createProfileMutation.mutate({
      userType: 'individual',
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FFFEF0] to-white">
      {/* Back Button */}
      <div className="px-6 pt-4 pb-2">
        <Link href="/">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="px-6 pt-2">
        {/* Title */}
        <div className="mb-8">
          <h1 
            className="text-[32px] font-extrabold leading-[39px] tracking-[0.005em]"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              color: '#1F2024'
            }}
          >
            회원가입
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="w-full max-w-[343px]">
            <label 
              className="block text-[20px] font-bold leading-6 mb-2"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#2F3036'
              }}
            >
              이름
            </label>
            <div
              className="flex items-center px-4 py-3 border-[1.5px] rounded-xl"
              style={{ 
                borderColor: formData.name ? '#006FFD' : '#C5C6CC',
                height: '48px'
              }}
            >
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full outline-none text-[14px] leading-5"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: '#1F2024'
                }}
                required
                data-testid="input-name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="w-full max-w-[343px]">
            <label 
              className="block text-[20px] font-bold leading-6 mb-2"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#2F3036'
              }}
            >
              이메일
            </label>
            <div
              className="flex items-center px-4 py-3 border-[1.5px] rounded-xl"
              style={{ 
                borderColor: formData.email ? '#006FFD' : '#C5C6CC',
                height: '48px'
              }}
            >
              <input
                type="email"
                placeholder="이메일을 입력해주세요"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full outline-none text-[14px] leading-5"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: '#1F2024'
                }}
                required
                data-testid="input-email"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="w-full max-w-[343px]">
            <label 
              className="block text-[20px] font-bold leading-6 mb-2"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#2F3036'
              }}
            >
              휴대폰 번호
            </label>
            <div
              className="flex items-center px-4 py-3 border-[1.5px] rounded-xl"
              style={{ 
                borderColor: formData.phone ? '#006FFD' : '#C5C6CC',
                height: '48px'
              }}
            >
              <input
                type="tel"
                placeholder="휴대폰 번호를 입력해주세요"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full outline-none text-[14px] leading-5"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: '#1F2024'
                }}
                required
                data-testid="input-phone"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="w-full max-w-[343px]">
            <label 
              className="block text-[20px] font-bold leading-6 mb-2"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#2F3036'
              }}
            >
              비밀번호
            </label>
            <div
              className="flex items-center px-4 py-3 border-[1.5px] rounded-xl"
              style={{ 
                borderColor: formData.password ? '#006FFD' : '#C5C6CC',
                height: '48px'
              }}
            >
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full outline-none text-[14px] leading-5"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: '#1F2024'
                }}
                required
                minLength={8}
                data-testid="input-password"
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="w-full max-w-[343px]">
            <label 
              className="block text-[20px] font-bold leading-6 mb-2"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#2F3036'
              }}
            >
              비밀번호 확인
            </label>
            <div
              className="flex items-center px-4 py-3 border-[1.5px] rounded-xl"
              style={{ 
                borderColor: formData.confirmPassword ? '#006FFD' : '#C5C6CC',
                height: '48px'
              }}
            >
              <input
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full outline-none text-[14px] leading-5"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: '#1F2024'
                }}
                required
                data-testid="input-confirm-password"
              />
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-center gap-3 w-full max-w-[343px] mt-8">
            <div
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: '24px',
                height: '24px',
                border: '1.5px solid #C5C6CC',
                borderRadius: '6px',
                backgroundColor: isAgreed ? '#006FFD' : 'transparent'
              }}
              onClick={() => setIsAgreed(!isAgreed)}
              data-testid="checkbox-terms"
            >
              {isAgreed && (
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <label 
              className="text-[12px] leading-4 cursor-pointer"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#71727A',
                letterSpacing: '0.01em'
              }}
              onClick={() => setIsAgreed(!isAgreed)}
            >
              저는 이용약관과 개인정보 처리방침을 읽었으며, 이에 동의합니다.
            </label>
          </div>

          {/* Submit Button */}
          <div className="w-full max-w-[343px] mt-12 pb-8">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-[16px] font-semibold text-white disabled:opacity-50"
              style={{ 
                backgroundColor: '#006FFD',
                fontFamily: 'Inter, sans-serif'
              }}
              disabled={createProfileMutation.isPending}
              data-testid="button-signup"
            >
              {createProfileMutation.isPending ? '가입 중...' : '가입하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
