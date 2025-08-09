import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobCard } from "@/components/ui/job-card";
// import { VoiceSearchModal } from "@/components/ui/voice-search-modal";
import { AIResumeWriter } from "@/components/AIResumeWriter";
import { ResumePreview } from "@/components/ResumePreview";
import {
  Bell,
  Briefcase,
  FileText,
  Mic,
  Users,
  Building,
  Wand2,
  GraduationCap,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  Lightbulb,
  Target,
  Edit
} from "lucide-react";

interface JobPosting {
  id: string;
  title: string;
  companyName: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  experienceLevel: string;
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  postedDate: string;
  matchingScore?: number;
  isSaved?: boolean;
  company?: {
    companyName: string;
  };
}

interface UserProfile {
  id: string;
  name?: string;
  title?: string;
  location?: string;
  phone?: string;
  email?: string;
  summary?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  [key: string]: any;
}

export default function IndividualDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Load recommended jobs
  const { data: recommendedJobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['/api/jobs/recommended'],
    enabled: !!user,
  });

  // Load user profile
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['/api/individual-profiles/me'],
    enabled: !!user,
  });

  // Save job mutation
  const saveJobMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest('POST', `/api/jobs/${jobId}/save`),
    onSuccess: (_, jobId) => {
      setSavedJobs(prev => new Set(prev).add(jobId));
      toast({
        title: "공고를 저장했습니다",
        description: "찜한 공고에서 확인할 수 있습니다.",
      });
    },
    onError: () => {
      toast({
        title: "저장 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  });

  // Unsave job mutation
  const unsaveJobMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest('DELETE', `/api/jobs/${jobId}/save`),
    onSuccess: (_, jobId) => {
      setSavedJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      toast({
        title: "저장을 취소했습니다",
      });
    }
  });

  const handleSaveJob = (jobId: string) => {
    saveJobMutation.mutate(jobId);
  };

  const handleUnsaveJob = (jobId: string) => {
    unsaveJobMutation.mutate(jobId);
  };

  const handleApplyJob = (jobId: string) => {
    toast({
      title: "지원이 완료되었습니다",
      description: "회사에서 검토 후 연락드릴 예정입니다.",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: `"${searchQuery}" 검색 결과`,
        description: "관련 채용정보를 찾고 있습니다.",
      });
    }
  };

  const getUserDisplayName = () => {
    if (profile && typeof profile === 'object' && 'name' in profile && profile.name) {
      return profile.name as string;
    }
    if (user && typeof user === 'object' && 'email' in user && user.email && typeof user.email === 'string') {
      return user.email.split('@')[0];
    }
    return '사용자';
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
                  {(recommendedJobs as any[]).slice(0, 3).map((job: any) => (
                    <JobCard
                      key={job.id}
                      job={{
                        ...job,
                        company: { companyName: job.companyName || '우수기업' },
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
                  <h4 className="text-body font-medium mb-2">맞춤 공고를 준비중입니다</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    프로필을 완성하시면 더 정확한 추천을 받을 수 있어요
                  </p>
                  <Link href="/individual/profile-setup">
                    <Button size="sm" data-testid="button-complete-profile">
                      프로필 완성하기
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Category Shortcuts */}
            <div className="mb-6">
              <h3 className="text-body font-bold mb-4">인기 직종</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Users, label: "고객상담", count: "24개" },
                  { icon: Building, label: "사무직", count: "18개" },
                  { icon: FileText, label: "관리직", count: "12개" },
                  { icon: Award, label: "전문직", count: "8개" }
                ].map((category, index) => (
                  <div key={index} className="card-mobile p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <category.icon className="w-5 h-5 text-primary mr-2" />
                        <span className="text-sm font-medium">{category.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{category.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* AI Resume Tab */}
          <TabsContent value="ai-resume" className="mt-6">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold mb-2">AI 이력서 작성</h3>
                <p className="text-gray-600 text-sm">
                  자연스러운 문장으로 경력을 설명하면 AI가 이력서로 변환해드립니다
                </p>
              </div>
              <AIResumeWriter />
              <ResumePreview data={undefined} />
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            {loadingProfile ? (
              <div className="space-y-4">
                <div className="card-mobile p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="card-mobile p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">기본 정보</h3>
                    <Link href="/individual/profile-setup">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        수정
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">이름</p>
                        <p className="font-medium">
                          {(profile as UserProfile)?.name || getUserDisplayName()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">희망 직종</p>
                        <p className="font-medium">
                          {(profile as UserProfile)?.title || '설정되지 않음'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">희망 근무지</p>
                        <p className="font-medium">
                          {(profile as UserProfile)?.location || '설정되지 않음'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">연락처</p>
                        <p className="font-medium">
                          {(profile as UserProfile)?.phone || '설정되지 않음'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">이메일</p>
                        <p className="font-medium">
                          {(profile as UserProfile)?.email || (user && typeof user === 'object' && 'email' in user && typeof user.email === 'string' ? user.email : '') || '설정되지 않음'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {(profile as UserProfile)?.summary && (
                  <div className="card-mobile p-6">
                    <h3 className="text-lg font-bold mb-4">자기소개</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {(profile as UserProfile).summary}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {(profile as UserProfile)?.skills && (profile as UserProfile).skills!.length > 0 && (
                  <div className="card-mobile p-6">
                    <h3 className="text-lg font-bold mb-4">보유 기술</h3>
                    <div className="flex flex-wrap gap-2">
                      {(profile as UserProfile).skills!.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {(profile as UserProfile)?.experience && (profile as UserProfile).experience!.length > 0 && (
                  <div className="card-mobile p-6">
                    <h3 className="text-lg font-bold mb-4">경력 사항</h3>
                    <div className="space-y-3">
                      {(profile as UserProfile).experience!.map((exp, index) => (
                        <div key={index} className="flex items-start">
                          <Calendar className="w-4 h-4 text-gray-400 mr-3 mt-1" />
                          <p className="text-gray-700">{exp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {(profile as UserProfile)?.education && (profile as UserProfile).education!.length > 0 && (
                  <div className="card-mobile p-6">
                    <h3 className="text-lg font-bold mb-4">학력 사항</h3>
                    <div className="space-y-3">
                      {(profile as UserProfile).education!.map((edu, index) => (
                        <div key={index} className="flex items-start">
                          <GraduationCap className="w-4 h-4 text-gray-400 mr-3 mt-1" />
                          <p className="text-gray-700">{edu}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state for incomplete profile */}
                {!(profile as UserProfile)?.summary && 
                 !(profile as UserProfile)?.skills?.length && 
                 !(profile as UserProfile)?.experience?.length && (
                  <div className="card-mobile text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Lightbulb className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-body font-medium mb-2">프로필을 완성해보세요</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      AI 이력서 기능을 사용하거나 직접 입력하여 프로필을 완성할 수 있습니다
                    </p>
                    <div className="space-y-2">
                      <Link href="/individual/profile-setup">
                        <Button size="sm" className="w-full">
                          직접 프로필 작성하기
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => {
                        const tabs = document.querySelector('[data-testid="tab-ai-resume"]') as HTMLElement;
                        tabs?.click();
                      }}>
                        AI 이력서로 자동 작성
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Voice Search Modal - Temporarily disabled */}
      {/* <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onTranscript={(transcript: string) => {
          setSearchQuery(transcript);
          setIsVoiceSearchOpen(false);
        }}
      /> */}
    </div>
  );
}