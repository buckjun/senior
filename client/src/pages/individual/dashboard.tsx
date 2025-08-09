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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AIResumeWriter } from "@/components/AIResumeWriter";
import { ResumePreview } from "@/components/ResumePreview";
import {
  Bell,
  Search,
  Briefcase,
  FileText,
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
  Settings,
  LogOut,
  Home,
  Plus,
  Layers,
  ArrowRight
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

interface ParsedResume {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  summary: string;
  skills: string[];
  experience: string[];
  education: string[];
}

export default function IndividualDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [parsedResumeData, setParsedResumeData] = useState<ParsedResume | undefined>(undefined);

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

  const getUserDisplayName = () => {
    if (profile && typeof profile === 'object' && 'name' in profile && profile.name) {
      return profile.name as string;
    }
    if (user && typeof user === 'object' && 'email' in user && user.email && typeof user.email === 'string') {
      return user.email.split('@')[0];
    }
    return '사용자';
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-web">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <h1 className="text-heading font-bold text-blue-600">5060 Career</h1>
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="flex items-center space-x-2 text-body text-gray-900 dark:text-gray-100 hover:text-blue-600">
                  <Home className="w-4 h-4" />
                  <span>홈</span>
                </Link>
                <Link href="/jobs" className="flex items-center space-x-2 text-body text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  <Briefcase className="w-4 h-4" />
                  <span>채용정보</span>
                </Link>
                <Link href="/ai-resume" className="flex items-center space-x-2 text-body text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  <Wand2 className="w-4 h-4" />
                  <span>AI 이력서</span>
                </Link>
              </nav>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="직종, 회사명으로 검색해보세요"
                  className="pl-10 text-body"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </form>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="hidden md:block">
                  <div className="text-label font-medium">{getUserDisplayName()}님</div>
                  <div className="text-caption text-gray-500">개인회원</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-web py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-body">{getUserDisplayName()}님</CardTitle>
                    <CardDescription>개인회원</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Link href="/individual/profile-setup">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-body">
                      <User className="w-4 h-4 mr-2" />
                      내 정보
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-body">
                    <Briefcase className="w-4 h-4 mr-2" />
                    지원 현황
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-body">
                    <Award className="w-4 h-4 mr-2" />
                    찜한 공고
                  </Button>
                  <Separator className="my-4" />
                  <Button variant="ghost" size="sm" className="w-full justify-start text-body">
                    <Settings className="w-4 h-4 mr-2" />
                    설정
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-body text-red-600 hover:text-red-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Dashboard Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard" className="text-body" data-testid="tab-dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  대시보드
                </TabsTrigger>
                <TabsTrigger value="ai-resume" className="text-body" data-testid="tab-ai-resume">
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI 이력서
                </TabsTrigger>
                <TabsTrigger value="profile" className="text-body" data-testid="tab-profile">
                  <User className="w-4 h-4 mr-2" />
                  내 정보
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* Welcome Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-title">안녕하세요, {getUserDisplayName()}님! 👋</CardTitle>
                    <CardDescription>
                      오늘도 새로운 기회를 찾아보세요. AI가 맞춤형 채용정보를 추천해드립니다.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-label text-gray-500">추천 공고</div>
                          <div className="text-title font-semibold">12개</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-label text-gray-500">지원 현황</div>
                          <div className="text-title font-semibold">3건</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-label text-gray-500">찜한 공고</div>
                          <div className="text-title font-semibold">8개</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommended Jobs */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-heading">AI 맞춤 추천</CardTitle>
                      <Badge className="status-badge status-info">새로 업데이트됨</Badge>
                    </div>
                    <CardDescription>
                      회원님의 경력과 선호도를 분석한 맞춤형 채용정보입니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingJobs ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : recommendedJobs && Array.isArray(recommendedJobs) && recommendedJobs.length > 0 ? (
                      <div className="space-y-4">
                        {(recommendedJobs as any[]).slice(0, 5).map((job: any) => (
                          <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-body font-semibold mb-1">{job.title}</h3>
                                <div className="flex items-center text-caption text-gray-500 space-x-4 mb-2">
                                  <div className="flex items-center">
                                    <Building className="w-3 h-3 mr-1" />
                                    {job.companyName}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {job.location}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs">{job.employmentType}</Badge>
                                  {job.salaryRange && (
                                    <Badge variant="outline" className="text-xs">{job.salaryRange}</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Badge className="status-badge status-success">
                                  매칭 {Math.floor(Math.random() * 20) + 80}%
                                </Badge>
                                <Button size="sm" onClick={() => saveJobMutation.mutate(job.id)}>
                                  지원하기
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <div className="text-body mb-2">맞춤 공고를 준비중입니다</div>
                        <div className="text-caption mb-4">프로필을 완성하시면 더 정확한 추천을 받을 수 있어요</div>
                        <Link href="/individual/profile-setup">
                          <Button size="sm">프로필 완성하기</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Job Category Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-heading">직종 선택</CardTitle>
                    <CardDescription>관심 있는 직종을 선택하여 맞춤 회사를 추천받으세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-4">
                      <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                        <Layers className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <h3 className="text-body font-medium mb-2">직종을 선택해주세요</h3>
                        <p className="text-caption text-gray-500 mb-4">
                          1-2개의 관심 직종을 선택하시면 맞춤 회사를 추천해드립니다
                        </p>
                        <Link href="/individual/job-categories">
                          <Button data-testid="button-select-job-categories">
                            <Layers className="w-4 h-4 mr-2" />
                            직종 선택하기
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-heading">인기 직종</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { icon: Users, label: "고객상담", count: "24개" },
                        { icon: Building, label: "사무직", count: "18개" },
                        { icon: FileText, label: "관리직", count: "12개" },
                        { icon: Award, label: "전문직", count: "8개" }
                      ].map((category, index) => (
                        <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <category.icon className="w-6 h-6 text-blue-600" />
                            <div className="text-body font-medium">{category.label}</div>
                            <div className="text-caption text-gray-500">{category.count}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Resume Tab */}
              <TabsContent value="ai-resume" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-title">AI 이력서 작성</CardTitle>
                    <CardDescription>
                      자연스러운 문장으로 경력을 설명하면 AI가 구조화된 이력서로 변환해드립니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIResumeWriter 
                      onResumeGenerated={(data) => setParsedResumeData(data)}
                      onProfileUpdated={() => {
                        queryClient.invalidateQueries({ queryKey: ['/api/individual-profiles/me'] });
                        toast({
                          title: "프로필 업데이트 완료",
                          description: "AI 분석 결과가 내 정보에 적용되었습니다.",
                        });
                      }}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-heading">미리보기</CardTitle>
                      {parsedResumeData && (
                        <Badge className="status-badge status-success">분석 완료</Badge>
                      )}
                    </div>
                    {parsedResumeData && (
                      <CardDescription>
                        AI가 분석한 이력서 정보를 확인하고 "내 정보"에 적용할 수 있습니다
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ResumePreview data={parsedResumeData} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                {loadingProfile ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Basic Information */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-heading">기본 정보</CardTitle>
                          <Link href="/individual/profile-setup">
                            <Button size="sm" variant="outline">
                              <Plus className="w-4 h-4 mr-1" />
                              수정
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center space-x-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-caption text-gray-500">이름</div>
                              <div className="text-body font-medium">
                                {(profile as UserProfile)?.name || getUserDisplayName()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Award className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-caption text-gray-500">희망 직종</div>
                              <div className="text-body font-medium">
                                {(profile as UserProfile)?.title || '설정되지 않음'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-caption text-gray-500">희망 근무지</div>
                              <div className="text-body font-medium">
                                {(profile as UserProfile)?.location || '설정되지 않음'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-caption text-gray-500">연락처</div>
                              <div className="text-body font-medium">
                                {(profile as UserProfile)?.phone || '설정되지 않음'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 md:col-span-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-caption text-gray-500">이메일</div>
                              <div className="text-body font-medium">
                                {(profile as UserProfile)?.email || (user && typeof user === 'object' && 'email' in user && typeof user.email === 'string' ? user.email : '') || '설정되지 않음'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Additional sections would go here */}
                    {!(profile as UserProfile)?.summary && 
                     !(profile as UserProfile)?.skills?.length && 
                     !(profile as UserProfile)?.experience?.length && (
                      <Card>
                        <CardContent className="text-center py-8">
                          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <div className="text-body font-medium mb-2">프로필을 완성해보세요</div>
                          <div className="text-caption text-gray-500 mb-4">
                            AI 이력서 기능을 사용하거나 직접 입력하여 프로필을 완성할 수 있습니다
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Link href="/individual/profile-setup">
                              <Button size="sm">직접 프로필 작성하기</Button>
                            </Link>
                            <Button size="sm" variant="outline" onClick={() => {
                              const tabs = document.querySelector('[data-testid="tab-ai-resume"]') as HTMLElement;
                              tabs?.click();
                            }}>
                              AI 이력서로 자동 작성
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}