import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Shield, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const businessTypes = [
  '도소매업', '제조업', '서비스업', '건설업', 
  '운수업', '음식점업', '숙박업', '기타'
];

export default function CompanySignup() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [isBusinessVerified, setIsBusinessVerified] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    businessNumber: '',
    ceoName: '',
    address: '',
    businessType: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    website: '',
    employeeCount: '',
    description: '',
  });

  const { toast } = useToast();

  // Replit Auth 사용: 로그인하지 않은 경우 로그인 페이지로 이동
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 py-8 bg-white">
        <div className="max-w-sm mx-auto w-full text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            기업 회원가입
          </h1>
          <p className="text-gray-600 mb-6">
            기업 프로필을 작성하기 위해 먼저 로그인해주세요
          </p>
          <Button
            asChild
            className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700 mb-4"
          >
            <a href="/api/login">로그인</a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full h-12"
          >
            <Link href="/">메인으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const verifyBusinessMutation = useMutation({
    mutationFn: async (data: { businessNumber: string; ceoName: string; companyName: string }) => {
      const response = await apiRequest('POST', '/api/verify-business', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isValid) {
        setIsBusinessVerified(true);
        toast({
          title: "사업자 인증 완료",
          description: "유효한 사업자등록번호입니다.",
        });
      } else {
        toast({
          title: "사업자 인증 실패",
          description: data.message || "사업자등록번호를 확인해주세요.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "인증 오류",
        description: "사업자 인증 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/company-profiles', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "기업 프로필 생성 완료",
        description: "기업 프로필이 성공적으로 생성되었습니다.",
      });
      setLocation('/company/dashboard');
    },
    onError: () => {
      toast({
        title: "프로필 생성 실패",
        description: "기업 프로필 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const handleVerifyBusiness = () => {
    if (!formData.businessNumber || !formData.ceoName || !formData.companyName) {
      toast({
        title: "입력 오류",
        description: "회사명, 사업자등록번호, 대표자명을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    verifyBusinessMutation.mutate({
      businessNumber: formData.businessNumber,
      ceoName: formData.ceoName,
      companyName: formData.companyName,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBusinessVerified) {
      toast({
        title: "사업자 인증 필요",
        description: "사업자등록번호 인증을 먼저 완료해주세요.",
        variant: "destructive",
      });
      return;
    }

    createProfileMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mr-3"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">기업 프로필 작성</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">기본 정보</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">회사명 *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="회사명을 입력하세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessNumber">사업자등록번호 *</Label>
                <div className="flex gap-2">
                  <Input
                    id="businessNumber"
                    value={formData.businessNumber}
                    onChange={(e) => handleInputChange('businessNumber', e.target.value)}
                    placeholder="000-00-00000"
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyBusiness}
                    disabled={verifyBusinessMutation.isPending || isBusinessVerified}
                    className="shrink-0"
                  >
                    {verifyBusinessMutation.isPending ? (
                      "인증중..."
                    ) : isBusinessVerified ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        인증완료
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-1" />
                        인증하기
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="ceoName">대표자명 *</Label>
                <Input
                  id="ceoName"
                  value={formData.ceoName}
                  onChange={(e) => handleInputChange('ceoName', e.target.value)}
                  placeholder="대표자명을 입력하세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">주소 *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="회사 주소를 입력하세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessType">업종 *</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => handleInputChange('businessType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="업종을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">연락처 정보</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactPerson">담당자명 *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="담당자명을 입력하세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">담당자 연락처 *</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="010-0000-0000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">담당자 이메일 *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@company.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">추가 정보 (선택사항)</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="website">회사 웹사이트</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://company.com"
                />
              </div>

              <div>
                <Label htmlFor="employeeCount">직원 수</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={formData.employeeCount}
                  onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                  placeholder="50"
                />
              </div>

              <div>
                <Label htmlFor="description">회사 소개</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="회사 소개를 입력하세요"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-orange-600 text-white hover:bg-orange-700"
            disabled={createProfileMutation.isPending || !isBusinessVerified}
          >
            {createProfileMutation.isPending ? "프로필 생성 중..." : "기업 프로필 생성"}
          </Button>
        </form>
      </div>
    </div>
  );
}