import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const salaryTypes = [
  { value: 'hourly', label: '시급' },
  { value: 'monthly', label: '월급' },
  { value: 'annual', label: '연봉' }
];

export default function JobPosting() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    workSchedule: 'flexible' as 'flexible' | 'fixed',
    salaryType: '' as 'hourly' | 'monthly' | 'annual' | '',
    salaryAmount: '',
    startDate: '',
    endDate: '',
    prefersSeniors: true,
    requirements: [] as string[],
    benefits: [] as string[],
  });
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch company profile to ensure user has company profile
  const { data: companyProfile } = useQuery({
    queryKey: ['/api/company-profiles/me'],
    enabled: !!user,
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/jobs', data);
    },
    onSuccess: () => {
      toast({
        title: "공고 등록 완료",
        description: "채용 공고가 성공적으로 등록되었습니다.",
      });
      setLocation('/company/dashboard');
    },
    onError: () => {
      toast({
        title: "등록 실패",
        description: "공고 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.description || !formData.location) {
        toast({
          title: "입력 오류",
          description: "모든 필수 항목을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.startDate || !formData.endDate) {
        toast({
          title: "입력 오류",
          description: "모집 기간을 설정해주세요.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyProfile) {
      toast({
        title: "권한 오류",
        description: "기업 프로필이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    const jobData = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      workSchedule: formData.workSchedule,
      salaryType: formData.salaryType || undefined,
      salaryAmount: formData.salaryAmount || undefined,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      prefersSeniors: formData.prefersSeniors,
      requirements: formData.requirements.length > 0 ? formData.requirements : undefined,
      benefits: formData.benefits.length > 0 ? formData.benefits : undefined,
    };

    createJobMutation.mutate(jobData);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return '기본 정보';
      case 2: return '근무 조건';
      case 3: return '추가 정보';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-border sticky top-0 z-10 safe-area-top">
        <div className="flex items-center">
          <Link href="/company/dashboard">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h2 className="flex-1 text-heading font-bold text-center">새 공고 등록</h2>
          {currentStep === 3 && (
            <Button 
              variant="ghost"
              className="text-primary font-semibold text-body"
              onClick={handleSubmit}
              disabled={createJobMutation.isPending}
              data-testid="button-complete"
            >
              완료
            </Button>
          )}
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <>
              <div>
                <Label htmlFor="title" className="block text-body font-semibold mb-2">
                  공고 제목 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="예: 시니어 바리스타, 시설 관리 경력직"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  data-testid="input-job-title"
                />
                <p className="text-sm text-gray-500 mt-2">정확한 직무명을 명시해주세요</p>
              </div>
              
              <div>
                <Label htmlFor="description" className="block text-body font-semibold mb-2">
                  직무 상세 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  rows={6}
                  placeholder="담당 업무, 자격 요건, 우대 사항을 상세히 입력해주세요&#10;&#10;예시:&#10;- 담당 업무: 커피 제조, 고객 서비스, 매장 관리&#10;- 자격 요건: 관련 경력 우대, 고객 서비스 마인드&#10;- 우대 사항: 50세 이상 채용 우대, 바리스타 자격증"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  data-testid="textarea-job-description"
                />
              </div>
              
              <div>
                <Label htmlFor="location" className="block text-body font-semibold mb-2">
                  근무 위치 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    type="text"
                    placeholder="예: 서울 강남구 테헤란로 123"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-job-location"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Work Conditions */}
          {currentStep === 2 && (
            <>
              <div>
                <Label className="block text-body font-semibold mb-3">
                  근로 조건 <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-3">
                  <label className="flex items-start p-4 border-2 border-border rounded-2xl cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="workSchedule"
                      value="flexible"
                      checked={formData.workSchedule === 'flexible'}
                      onChange={(e) => handleInputChange('workSchedule', e.target.value)}
                      className="w-5 h-5 text-primary mr-4 mt-1"
                      data-testid="radio-flexible-schedule"
                    />
                    <div>
                      <p className="text-body font-semibold">시간/요일 협의 가능</p>
                      <p className="text-sm text-gray-500">근무시간과 요일을 상호 협의하여 결정</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start p-4 border-2 border-border rounded-2xl cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="workSchedule"
                      value="fixed"
                      checked={formData.workSchedule === 'fixed'}
                      onChange={(e) => handleInputChange('workSchedule', e.target.value)}
                      className="w-5 h-5 text-primary mr-4 mt-1"
                      data-testid="radio-fixed-schedule"
                    />
                    <div>
                      <p className="text-body font-semibold">시간/요일 고정 (협의 불가)</p>
                      <p className="text-sm text-gray-500">정해진 근무 스케줄을 준수</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div>
                <Label className="block text-body font-semibold mb-2">
                  모집 기간 <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="startDate" className="block text-sm text-gray-600 mb-1">시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                      data-testid="input-start-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="block text-sm text-gray-600 mb-1">마감일</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="block text-body font-semibold mb-2">급여 조건 (선택)</Label>
                <div className="space-y-3">
                  <select
                    value={formData.salaryType}
                    onChange={(e) => handleInputChange('salaryType', e.target.value)}
                    className="w-full p-4 border-2 border-border rounded-2xl text-body focus:border-primary outline-none appearance-none bg-white"
                    data-testid="select-salary-type"
                  >
                    <option value="">급여 유형 선택</option>
                    {salaryTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="급여를 입력해주세요"
                    value={formData.salaryAmount}
                    onChange={(e) => handleInputChange('salaryAmount', e.target.value)}
                    data-testid="input-salary-amount"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <>
              <div>
                <Label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.prefersSeniors}
                    onChange={(e) => handleInputChange('prefersSeniors', e.target.checked)}
                    className="w-5 h-5 text-primary"
                    data-testid="checkbox-prefers-seniors"
                  />
                  <span className="text-body font-semibold">시니어 우대 채용</span>
                </Label>
                <p className="text-sm text-gray-500 ml-8">
                  50세 이상 지원자를 우대한다는 표시가 공고에 노출됩니다
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-body font-semibold">공고 미리보기</h4>
                <div className="card-mobile bg-gray-50 p-4">
                  <h5 className="text-body font-bold mb-2" data-testid="preview-job-title">
                    {formData.title || '공고 제목'}
                  </h5>
                  <div className="text-gray-600 mb-3">
                    <p>{companyProfile?.companyName || '회사명'}</p>
                    <div className="flex items-center text-sm mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{formData.location || '근무 위치'}</span>
                      {formData.workSchedule === 'flexible' && (
                        <>
                          <span className="mx-2">·</span>
                          <span>시간협의가능</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-accent font-bold">
                      {formData.salaryType && formData.salaryAmount
                        ? `${salaryTypes.find(t => t.value === formData.salaryType)?.label} ${Number(formData.salaryAmount).toLocaleString()}${formData.salaryType === 'hourly' ? '원' : '만원'}`
                        : '급여협의'
                      }
                    </div>
                    {formData.prefersSeniors && (
                      <div className="status-badge status-info">시니어 우대</div>
                    )}
                  </div>
                </div>
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
                disabled={createJobMutation.isPending}
                data-testid="button-submit-job"
              >
                {createJobMutation.isPending ? '등록 중...' : '공고 등록하기'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
