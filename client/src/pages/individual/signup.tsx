import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const interestKeywords = [
  '카페·바리스타', '시설관리', '마트·매장관리', 
  '상담·고객서비스', '사회복지', '경비·보안',
  '조리·요리', '청소·환경', '운전·배송'
];

export default function IndividualSignup() {
  const [, setLocation] = useLocation();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createProfileMutation.mutate({
      userType: 'individual',
      interests: selectedKeywords
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-border sticky top-0 z-10 safe-area-top">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h2 className="flex-1 text-heading font-bold text-center">개인 회원가입</h2>
          <div className="w-10"></div>
        </div>
      </div>
      
      <div className="p-6 pb-8">
        {/* Social Login Section */}
        <div className="mb-8">
          <h3 className="text-body font-semibold mb-4">간편 로그인</h3>
          
          <div className="space-y-3">
            <Link href="/api/login">
              <Button 
                className="w-full bg-kakao text-gray-800 py-4 px-6 rounded-2xl text-body font-semibold flex items-center justify-center shadow-lg hover:bg-kakao/90"
                data-testid="button-kakao-login"
              >
                <span className="mr-3 font-bold text-xl">K</span>
                카카오로 시작하기
              </Button>
            </Link>
            
            <Link href="/api/login">
              <Button 
                className="w-full bg-naver text-white py-4 px-6 rounded-2xl text-body font-semibold flex items-center justify-center shadow-lg hover:bg-naver/90"
                data-testid="button-naver-login"
              >
                <span className="mr-3 font-bold text-xl">N</span>
                네이버로 시작하기
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Divider */}
        <div className="flex items-center mb-8">
          <div className="flex-1 h-px bg-border"></div>
          <span className="px-4 text-gray-500">또는</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>
        
        {/* Email Signup */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="block text-body font-semibold mb-2">
              이메일 주소
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              data-testid="input-email"
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block text-body font-semibold mb-2">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="8자 이상 입력해주세요"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              minLength={8}
              data-testid="input-password"
            />
          </div>
          
          {/* Interest Keywords (Optional) */}
          <div className="mt-8">
            <h3 className="text-body font-semibold mb-4">관심 분야 (선택사항)</h3>
            <div className="flex flex-wrap gap-3">
              {interestKeywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                  className={`px-4 py-2 cursor-pointer text-body ${
                    selectedKeywords.includes(keyword) 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleKeywordToggle(keyword)}
                  data-testid={`keyword-${keyword}`}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full btn-primary mt-6"
            disabled={createProfileMutation.isPending}
            data-testid="button-signup-submit"
          >
            {createProfileMutation.isPending ? '가입 중...' : '가입하기'}
          </Button>
        </form>
      </div>
    </div>
  );
}
