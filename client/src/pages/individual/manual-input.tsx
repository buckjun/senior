import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, User, Briefcase, GraduationCap, Award, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { IndividualProfile, InsertIndividualProfile } from '@shared/schema';

interface ManualProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  certifications: string;
}

export default function ManualInputPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ManualProfileData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    certifications: ''
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<InsertIndividualProfile>) => {
      return await apiRequest('/api/individual-profiles/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "프로필 저장 완료",
        description: "이력서가 성공적으로 저장되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/individual-profiles/me'] });
      setLocation('/individual/profile-view');
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast({
        title: "저장 실패",
        description: "프로필 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof ManualProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.summary) {
      toast({
        title: "필수 항목 누락",
        description: "이름과 자기소개는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    const profileData: Partial<InsertIndividualProfile> = {
      fullName: formData.fullName,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      summary: formData.summary,
      experience: formData.experience || null,
      education: formData.education || null,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
      certifications: formData.certifications ? formData.certifications.split(',').map(s => s.trim()) : [],
    };

    updateProfileMutation.mutate(profileData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/individual/profile-setup')}
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                뒤로
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  직접 이력서 작성
                </h1>
                <p className="text-sm text-gray-500">
                  양식에 맞춰 이력서를 직접 입력하세요
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-save-profile"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">이름 *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="홍길동"
                  data-testid="input-fullname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="hong@example.com"
                  data-testid="input-email"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="010-1234-5678"
                  data-testid="input-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">주소</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="서울특별시 강남구"
                  data-testid="input-address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 자기소개 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              자기소개
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="summary">자기소개 *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="간단한 자기소개와 업무 경험을 작성해주세요..."
                rows={4}
                data-testid="textarea-summary"
              />
            </div>
          </CardContent>
        </Card>

        {/* 경력사항 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              경력사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="experience">주요 경력</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="회사명, 재직기간, 담당업무 등을 작성해주세요..."
                rows={5}
                data-testid="textarea-experience"
              />
            </div>
          </CardContent>
        </Card>

        {/* 학력사항 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              학력사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="education">학력</Label>
              <Textarea
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="졸업년도, 학교명, 전공 등을 작성해주세요..."
                rows={3}
                data-testid="textarea-education"
              />
            </div>
          </CardContent>
        </Card>

        {/* 보유 기술 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              보유 기술 및 자격증
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skills">보유 기술</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                placeholder="Excel, 운전면허, 컴퓨터활용능력 (쉼표로 구분)"
                data-testid="input-skills"
              />
              <p className="text-xs text-gray-500">
                보유하신 기술이나 능력을 쉼표(,)로 구분하여 입력해주세요
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certifications">자격증</Label>
              <Input
                id="certifications"
                value={formData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
                placeholder="정보처리기사, 토익 850점, 컴활 1급 (쉼표로 구분)"
                data-testid="input-certifications"
              />
              <p className="text-xs text-gray-500">
                보유하신 자격증을 쉼표(,)로 구분하여 입력해주세요
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 안내 문구 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">💡</div>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">작성 가이드</p>
              <ul className="space-y-1 text-xs">
                <li>• 이름과 자기소개는 필수 입력 항목입니다</li>
                <li>• 경력과 학력은 최신 순으로 작성하는 것을 권장합니다</li>
                <li>• 기술과 자격증은 쉼표(,)로 구분하여 입력해주세요</li>
                <li>• 저장 후 언제든지 수정할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}