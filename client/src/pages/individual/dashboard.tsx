import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from '@/components/ui/mobile-nav';
import { JobCard } from '@/components/ui/job-card';
import { VoiceInput } from '@/components/ui/voice-input';
import { AIResumeWriter } from '@/components/AIResumeWriter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mic, GraduationCap, FileText, Clock, MapPin, Wand2, Briefcase } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { JobPosting } from '@shared/schema';

export default function IndividualDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recommended jobs
  const { data: recommendedJobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['/api/jobs/recommended'],
    enabled: !!user,
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['/api/individual-profiles/me'],
    enabled: !!user,
  });

  // Save/unsave job mutations
  const saveJobMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest('POST', `/api/jobs/${jobId}/save`, {}),
    onSuccess: () => {
      toast({
        title: "공고 저장됨",
        description: "관심 공고에 추가되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-jobs'] });
    },
  });

  const unsaveJobMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest('DELETE', `/api/jobs/${jobId}/save`, {}),
    onSuccess: () => {
      toast({
        title: "공고 저장 취소됨",
        description: "관심 공고에서 제거되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-jobs'] });
    },
  });

  const applyJobMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest('POST', `/api/jobs/${jobId}/apply`, {
      coverLetter: "AI 매칭 시스템을 통한 지원입니다."
    }),
    onSuccess: () => {
      toast({
        title: "지원 완료",
        description: "성공적으로 지원되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/my'] });
    },
  });

  const handleSaveJob = (jobId: string) => {
    saveJobMutation.mutate(jobId);
  };

  const handleUnsaveJob = (jobId: string) => {
    unsaveJobMutation.mutate(jobId);
  };

  const handleApplyJob = (jobId: string) => {
    applyJobMutation.mutate(jobId);
  };

  const handleVoiceSearch = (transcript: string) => {
    setSearchQuery(transcript);
    // Navigate to search with voice query
    window.location.href = `/individual/search?q=${encodeURIComponent(transcript)}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/individual/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Get user display info
  const getUserDisplayName = () => {
    if (profile && typeof profile === 'object' && 'summary' in profile) {
      const names = ['김민수', '이영희', '박정호', '최미경', '정수진'];
      return names[Math.floor(Math.random() * names.length)];
    }
    return (user as any)?.firstName ? `${(user as any).firstName}${(user as any).lastName || ''}` : '사용자';
  };

  const getUserExperience = () => {
    if (profile && typeof profile === 'object' && 'experience' in profile) {
      return '경력 15년 · 유통관리 전문';
    }
    return '프로필을 완성해주세요';
  };

  // Show push notification simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: "새로운 공고가 등록되었어요! 📋",
        description: "시니어 바리스타 - 95% 매칭",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header with Profile */}
      <div className="gradient-primary px-4 py-6 text-white safe-area-top">
        <div className="flex items-center justify-between mb-4">
          <Link href="/individual/profile-setup">
            <div className="flex items-center cursor-pointer">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3 hover:bg-white/30 transition-colors">
                <span className="text-white font-bold text-lg">
                  {getUserDisplayName().charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-body font-bold" data-testid="text-user-name">
                  {getUserDisplayName()}님
                </h2>
                <p className="text-sm opacity-90" data-testid="text-user-experience">
                  {getUserExperience()}
                </p>
              </div>
            </div>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0 bg-white/20 hover:bg-white/30"
            data-testid="button-notifications"
          >
            <Bell className="text-white w-5 h-5" />
          </Button>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="새로운 분야를 탐색해보세요 (예: 바리스타, 사회복지사)"
            className="w-full p-4 rounded-2xl text-gray-800 text-body pr-12 border-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
          <Button
            type="button"
            onClick={() => setIsVoiceSearchOpen(true)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center p-0"
            data-testid="button-voice-search"
          >
            <Mic className="text-white w-4 h-4" />
          </Button>
        </form>
      </div>
      
      <div className="p-4">
        {/* Dashboard Tabs */}
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs" data-testid="tab-jobs">
              <Briefcase className="w-4 h-4 mr-2" />
              채용정보
            </TabsTrigger>
            <TabsTrigger value="ai-resume" data-testid="tab-ai-resume">
              <Wand2 className="w-4 h-4 mr-2" />
              AI 이력서
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <GraduationCap className="w-4 h-4 mr-2" />
              내 정보
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="mt-6">
            {/* AI Recommendations */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-body font-bold" data-testid="text-recommendations-title">
                  AI 맞춤 추천
                </h3>
                <Badge className="status-badge status-info">
                  새로 업데이트됨
                </Badge>
              </div>
          
          {/* Job Cards */}
          {loadingJobs ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="card-mobile animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendedJobs && Array.isArray(recommendedJobs) && recommendedJobs.length > 0 ? (
            <div className="space-y-4">
              {(recommendedJobs as JobPosting[]).slice(0, 3).map((job: JobPosting) => (
                <JobCard
                  key={job.id}
                  job={{
                    ...job,
                    company: { companyName: '우수기업' },
                    matchingScore: Math.floor(Math.random() * 20) + 80, // 80-100% range
                  }}
                  onSave={handleSaveJob}
                  onUnsave={handleUnsaveJob}
                  onApply={handleApplyJob}
                  showMatchingScore={true}
                />
              ))}
            </div>
          ) : (
            <div className="card-mobile text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-body font-semibold mb-2">추천 공고가 없습니다</h4>
              <p className="text-gray-600 mb-4">프로필을 완성하면 맞춤 공고를 받아볼 수 있어요</p>
              <Link href="/individual/profile-setup">
                <Button className="btn-primary">프로필 완성하기</Button>
              </Link>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-body font-bold mb-4">빠른 서비스</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/education-programs">
                <div className="card-mobile text-center p-6 hover:shadow-xl transition-shadow" data-testid="button-education-programs">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <GraduationCap className="text-secondary text-xl" />
                  </div>
                  <p className="text-body font-semibold">교육 프로그램</p>
                </div>
              </Link>
              
              <Link href="/resume">
                <div className="card-mobile text-center p-6 hover:shadow-xl transition-shadow" data-testid="button-my-resume">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <FileText className="text-accent text-xl" />
                </div>
                <p className="text-body font-semibold">내 이력서</p>
              </div>
            </Link>
          </div>
          
          {/* Data Management Section */}
          <div className="mt-4">
            <Link href="/admin/excel-upload">
              <div className="card-mobile p-4 hover:shadow-lg transition-shadow" data-testid="button-excel-upload">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg mr-3 flex items-center justify-center">
                    <FileText className="text-blue-600 w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-semibold">재취업 데이터 업로드</p>
                    <p className="text-sm text-gray-600">엑셀 파일로 성공 사례 관리</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </TabsContent>

      {/* AI Resume Tab */}
      <TabsContent value="ai-resume" className="mt-6">
        <AIResumeWriter 
          onProfileUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/individual-profiles/me'] });
            toast({
              title: "프로필 업데이트 완료",
              description: "AI 이력서 정보가 내 프로필에 반영되었습니다.",
            });
          }}
        />
      </TabsContent>

      {/* Profile Tab */}
      <TabsContent value="profile" className="mt-6">
        <div className="space-y-4">
          <div className="card-mobile p-6">
            <h3 className="text-lg font-bold mb-4">내 프로필 정보</h3>
            {profile ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">자기소개</label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded">
                    {(profile as any)?.summary || "자기소개를 작성해주세요."}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">보유 스킬</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(() => {
                      try {
                        const skills = (profile as any)?.skills ? JSON.parse((profile as any).skills) : [];
                        return Array.isArray(skills) && skills.length > 0 ? skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        )) : (
                          <span className="text-sm text-gray-500">등록된 스킬이 없습니다.</span>
                        );
                      } catch {
                        return <span className="text-sm text-gray-500">등록된 스킬이 없습니다.</span>;
                      }
                    })()}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">선호 직종</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(() => {
                      try {
                        const jobTypes = (profile as any)?.preferredJobTypes ? JSON.parse((profile as any).preferredJobTypes) : [];
                        return Array.isArray(jobTypes) && jobTypes.length > 0 ? jobTypes.map((job: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {job}
                          </Badge>
                        )) : (
                          <span className="text-sm text-gray-500">선호 직종을 설정해주세요.</span>
                        );
                      } catch {
                        return <span className="text-sm text-gray-500">선호 직종을 설정해주세요.</span>;
                      }
                    })()}
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/individual/profile-setup">
                    <Button className="w-full">프로필 수정하기</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">프로필 정보를 불러오는 중...</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

    </Tabs>
      </div>
      
      {/* Voice Search Modal */}
      <VoiceInput
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onTranscript={handleVoiceSearch}
        placeholder="새로운 분야를 말씀해주세요"
      />
      
      {/* Bottom Navigation */}
      <MobileNav type="individual" />
    </div>
  );
}
