import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Briefcase } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function IndividualProfileSetup() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    birthYear: '',
    summary: '',
    experience: '',
    skills: '',
    preferredJobTypes: '',
    preferredLocations: '',
    workTimeFlexibility: true,
  });

  const { toast } = useToast();

  // Check if user already has a profile
  const { data: existingProfile } = useQuery({
    queryKey: ['/api/individual-profiles/me'],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 py-8 bg-white">
        <div className="max-w-sm mx-auto w-full text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            개인 프로필 작성
          </h1>
          <p className="text-gray-600 mb-6">
            개인 프로필을 작성하기 위해 먼저 로그인해주세요
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

  // If profile exists, redirect to dashboard
  if (existingProfile) {
    setLocation('/individual/dashboard');
    return null;
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/individual-profiles', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "프로필 생성 완료",
        description: "개인 프로필이 성공적으로 생성되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/individual-profiles/me'] });
      setLocation('/individual/dashboard');
    },
    onError: () => {
      toast({
        title: "프로필 생성 실패",
        description: "개인 프로필 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const profileData = {
      ...formData,
      birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
      experience: formData.experience ? [formData.experience] : [],
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
      preferredJobTypes: formData.preferredJobTypes ? formData.preferredJobTypes.split(',').map(s => s.trim()) : [],
      preferredLocations: formData.preferredLocations ? formData.preferredLocations.split(',').map(s => s.trim()) : [],
    };

    createProfileMutation.mutate(profileData);
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
            <h1 className="text-lg font-semibold">개인 프로필 작성</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium">기본 정보</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="birthYear">출생년도</Label>
                <Input
                  id="birthYear"
                  type="number"
                  value={formData.birthYear}
                  onChange={(e) => handleInputChange('birthYear', e.target.value)}
                  placeholder="1965"
                  min="1950"
                  max="1975"
                />
              </div>

              <div>
                <Label htmlFor="summary">자기소개</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="간단한 자기소개를 작성해주세요"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* 경력 정보 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium">경력 정보</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="experience">주요 경력</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="주요 경력사항을 작성해주세요"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="skills">보유 기술/자격증</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  placeholder="컴퓨터 활용, 운전면허, 요리 등 (쉼표로 구분)"
                />
              </div>
            </div>
          </div>

          {/* 구직 희망 사항 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">구직 희망 사항</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="preferredJobTypes">희망 직종</Label>
                <Input
                  id="preferredJobTypes"
                  value={formData.preferredJobTypes}
                  onChange={(e) => handleInputChange('preferredJobTypes', e.target.value)}
                  placeholder="사무직, 서비스업, 제조업 등 (쉼표로 구분)"
                />
              </div>

              <div>
                <Label htmlFor="preferredLocations">희망 근무지역</Label>
                <Input
                  id="preferredLocations"
                  value={formData.preferredLocations}
                  onChange={(e) => handleInputChange('preferredLocations', e.target.value)}
                  placeholder="서울, 경기, 인천 등 (쉼표로 구분)"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="workTimeFlexibility"
                  checked={formData.workTimeFlexibility}
                  onChange={(e) => handleInputChange('workTimeFlexibility', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="workTimeFlexibility">근무시간 조정 가능</Label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700"
            disabled={createProfileMutation.isPending}
          >
            {createProfileMutation.isPending ? "프로필 생성 중..." : "프로필 생성"}
          </Button>
        </form>
      </div>
    </div>
  );
}