import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const businessTypes = [
  '도소매업', '제조업', '서비스업', '건설업', 
  '운수업', '음식점업', '숙박업', '기타'
];

export default function CompanySignup() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isBusinessVerified, setIsBusinessVerified] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Business Info
    companyName: '',
    businessNumber: '',
    ceoName: '',
    address: '',
    detailAddress: '',
    businessType: '',
    
    // Step 2: Contact Info
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    
    // Step 3: Additional Info (Optional)
    website: '',
    employeeCount: '',
    description: '',
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const verifyBusinessMutation = useMutation({
    mutationFn: async (businessNumber: string) => {
      const response = await apiRequest('POST', '/api/verify-business', { businessNumber });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.valid && data.status === 'active') {
        setIsBusinessVerified(true);
        // 사업자 정보 자동 입력
        const updatedData: any = {};
        if (data.businessName) {
          updatedData.companyName = data.businessName;
        }
        if (data.representativeName) {
          updatedData.ceoName = data.representativeName;
        }
        if (data.businessAddress) {
          updatedData.address = data.businessAddress;
        }
        if (data.businessType) {
          updatedData.businessType = data.businessType;
        }
        
        if (Object.keys(updatedData).length > 0) {
          setFormData(prev => ({ ...prev, ...updatedData }));
        }
        toast({
          title: "사업자 인증 완료",
          description: "유효한 사업자등록번호입니다. 사업자 정보가 자동으로 입력되었습니다.",
        });
      } else {
        const errorMsg = data.errorMessage || '운영 중이지 않거나 유효하지 않은 사업자등록번호입니다.';
        toast({
          title: "인증 실패",
          description: errorMsg,
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

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      // 먼저 사용자 등록
      const registerResponse = await apiRequest('POST', '/api/register', {
        userType: 'company',
        name: data.contactPerson,
        email: data.contactEmail,
        password: password,
        phone: data.contactPhone
      });
      
      // 그 다음 회사 프로필 생성
      const profileResponse = await apiRequest('POST', '/api/company-profiles', data);
      return profileResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "가입 완료",
        description: "기업 회원가입이 완료되었습니다.",
      });
      setLocation('/dashboard');
    },
    onError: () => {
      toast({
        title: "가입 실패",
        description: "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const handleBusinessVerification = () => {
    if (formData.businessNumber.length === 12) { // Format: 000-00-00000
      const cleanNumber = formData.businessNumber.replace(/[^0-9]/g, '');
      if (cleanNumber.length === 10) {
        verifyBusinessMutation.mutate(cleanNumber);
      } else {
        toast({
          title: "잘못된 형식",
          description: "사업자등록번호는 10자리 숫자여야 합니다.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "잘못된 형식",
        description: "사업자등록번호 형식을 확인해주세요. (000-00-00000)",
        variant: "destructive",
      });
    }
  };

  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
  };

  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBusinessNumber(e.target.value);
    handleInputChange('businessNumber', formatted);
    setIsBusinessVerified(false);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate required fields for step 1
      if (!formData.companyName || !formData.businessNumber || !formData.ceoName || 
          !formData.address || !formData.businessType || !isBusinessVerified) {
        toast({
          title: "입력 오류",
          description: "모든 필수 항목을 입력하고 사업자 인증을 완료해주세요.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate required fields for step 2
      if (!formData.contactPerson || !formData.contactPhone || !formData.contactEmail || !password || !confirmPassword) {
        toast({
          title: "입력 오류",
          description: "모든 담당자 정보와 비밀번호를 입력해주세요.",
          variant: "destructive",
        });
        return;
      }
      
      if (password !== confirmPassword) {
        toast({
          title: "비밀번호 불일치",
          description: "비밀번호가 일치하지 않습니다.",
          variant: "destructive",
        });
        return;
      }
      
      setCurrentStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation
    if (!password || !confirmPassword) {
      toast({
        title: "입력 오류",
        description: "비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    createCompanyMutation.mutate({
      companyName: formData.companyName,
      businessNumber: formData.businessNumber.replace(/[^0-9]/g, ''),
      ceoName: formData.ceoName,
      address: `${formData.address} ${formData.detailAddress}`.trim(),
      businessType: formData.businessType,
      contactPerson: formData.contactPerson,
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail,
      website: formData.website || undefined,
      employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
      description: formData.description || undefined,
    });
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return '사업자 정보 입력';
      case 2: return '담당자 정보 입력';
      case 3: return '추가 정보 입력';
      default: return '';
    }
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
          <h2 className="flex-1 text-heading font-bold text-center">기업 회원가입</h2>
          <div className="w-10"></div>
        </div>
      </div>
      
      <div className="p-6 pb-8">
        {/* Progress Indicator */}
        <div className="flex items-center mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full mr-2 last:mr-0 ${
                step <= currentStep ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        
        <h3 className="text-body font-bold mb-6">{getStepTitle()}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <>
              <div>
                <Label htmlFor="companyName" className="block text-body font-semibold mb-2">
                  회사명 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="(주)회사명을 입력해주세요"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                  data-testid="input-company-name"
                />
              </div>
              
              <div>
                <Label htmlFor="businessNumber" className="block text-body font-semibold mb-2">
                  사업자등록번호 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="businessNumber"
                    type="text"
                    placeholder="000-00-00000"
                    value={formData.businessNumber}
                    onChange={handleBusinessNumberChange}
                    className="pr-20"
                    maxLength={12}
                    required
                    data-testid="input-business-number"
                  />
                  <Button
                    type="button"
                    onClick={handleBusinessVerification}
                    disabled={verifyBusinessMutation.isPending || isBusinessVerified}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-1 text-sm"
                    data-testid="button-verify-business"
                  >
                    {isBusinessVerified ? <Check className="w-4 h-4" /> : '확인'}
                  </Button>
                </div>
                <div className="flex items-center text-sm text-secondary mt-2">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>국세청 사업자정보로 실시간 인증됩니다</span>
                  {isBusinessVerified && (
                    <Check className="w-4 h-4 ml-2 text-secondary" />
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="ceoName" className="block text-body font-semibold mb-2">
                  대표자명 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ceoName"
                  type="text"
                  placeholder="대표자 성명을 입력해주세요"
                  value={formData.ceoName}
                  onChange={(e) => handleInputChange('ceoName', e.target.value)}
                  required
                  data-testid="input-ceo-name"
                />
              </div>
              
              <div>
                <Label htmlFor="address" className="block text-body font-semibold mb-2">
                  사업장 주소 <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-3">
                  <Input
                    id="address"
                    type="text"
                    placeholder="기본 주소를 입력해주세요"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    data-testid="input-address"
                  />
                  <Input
                    id="detailAddress"
                    type="text"
                    placeholder="상세 주소를 입력해주세요"
                    value={formData.detailAddress}
                    onChange={(e) => handleInputChange('detailAddress', e.target.value)}
                    data-testid="input-detail-address"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="businessType" className="block text-body font-semibold mb-2">
                  업종/업태 <span className="text-destructive">*</span>
                </Label>
                <select
                  id="businessType"
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full p-4 border-2 border-border rounded-2xl text-body focus:border-primary outline-none appearance-none bg-white"
                  required
                  data-testid="select-business-type"
                >
                  <option value="">업종을 선택해주세요</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <>
              <div>
                <Label htmlFor="contactPerson" className="block text-body font-semibold mb-2">
                  담당자 이름 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  type="text"
                  placeholder="담당자 성명을 입력해주세요"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  required
                  data-testid="input-contact-person"
                />
              </div>
              
              <div>
                <Label htmlFor="contactPhone" className="block text-body font-semibold mb-2">
                  담당자 연락처 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="연락처를 입력해주세요"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  required
                  data-testid="input-contact-phone"
                />
              </div>
              
              <div>
                <Label htmlFor="contactEmail" className="block text-body font-semibold mb-2">
                  담당자 이메일 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="이메일을 입력해주세요 (로그인 ID로 사용)"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  required
                  data-testid="input-contact-email"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-body font-semibold mb-2">
                  비밀번호 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="block text-body font-semibold mb-2">
                  비밀번호 확인 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  data-testid="input-confirm-password"
                />
              </div>
            </>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <>
              <div>
                <Label htmlFor="website" className="block text-body font-semibold mb-2">
                  회사 홈페이지 (선택)
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.company.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  data-testid="input-website"
                />
              </div>
              
              <div>
                <Label htmlFor="employeeCount" className="block text-body font-semibold mb-2">
                  직원 수 (선택)
                </Label>
                <Input
                  id="employeeCount"
                  type="number"
                  placeholder="직원 수를 입력해주세요"
                  value={formData.employeeCount}
                  onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                  data-testid="input-employee-count"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="block text-body font-semibold mb-2">
                  회사 소개 (선택)
                </Label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="회사의 핵심 가치, 비전 등을 입력해주세요"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-4 border-2 border-border rounded-2xl text-body focus:border-primary outline-none resize-none"
                  data-testid="textarea-description"
                />
              </div>
            </>
          )}
          
          <div className="flex space-x-4 mt-8">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 py-4 text-body"
                data-testid="button-prev-step"
              >
                이전
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="flex-1 btn-primary"
                data-testid="button-next-step"
              >
                다음 단계
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 btn-primary"
                disabled={createCompanyMutation.isPending}
                data-testid="button-complete-signup"
              >
                {createCompanyMutation.isPending ? '가입 중...' : '가입 완료'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
