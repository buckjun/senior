import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  ArrowRight,
  Eye,
  BookOpen
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
  title?: string;
  location?: string;
  phone?: string;
  summary?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  previousSalary?: string;
  desiredSalary?: string;
  employmentType?: string;
  availableStartDate?: string;
  certifications?: string[];
}

export default function Dashboard() {
  const [activeBottomSection, setActiveBottomSection] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { user, isLoading: authLoading } = useAuth();

  // Fetch user profile
  const { data: profile, isLoading: loadingProfile } = useQuery<UserProfile>({
    queryKey: ['/api/individual-profiles/me'],
  });

  // Fetch job recommendations  
  const { data: jobRecommendations = [] } = useQuery<JobPosting[]>({
    queryKey: ['/api/jobs/recommended'],
  });

  // Get display name
  const getUserDisplayName = () => {
    if ((user as any)?.firstName && (user as any)?.lastName) {
      return `${(user as any).firstName} ${(user as any).lastName}`;
    } else if ((user as any)?.firstName) {
      return (user as any).firstName;
    } else if ((user as any)?.email) {
      return (user as any).email.split('@')[0];
    }
    return '사용자';
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#FFFEF0] to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F3036]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FFFEF0] to-white text-[#2F3036]">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-web">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-xl font-bold text-[#2F3036]">
                일있슈
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="원하는 직종이나 회사를 검색하세요..."
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#2F3036] text-[#2F3036]"
                  data-testid="input-search"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-[#2F3036] hover:bg-gray-100 rounded-full" data-testid="button-notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="relative" data-user-menu>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-[#2F3036] hover:bg-gray-100 rounded-lg"
                  data-testid="button-user-menu"
                >
                  <div className="w-8 h-8 bg-[#E8F4FD] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#2F3036]" />
                  </div>
                </button>
                
                {/* Floating User Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border shadow-lg z-50">
                    <div className="px-4 py-3 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#E8F4FD] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[#2F3036]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#2F3036]">{getUserDisplayName()}</div>
                          <div className="text-sm text-gray-500">{(user as any)?.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link href="/individual/profile-view">
                        <button className="w-full text-left px-4 py-2 text-sm text-[#2F3036] hover:bg-gray-50 flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>내 정보</span>
                        </button>
                      </Link>
                      <button className="w-full text-left px-4 py-2 text-sm text-[#2F3036] hover:bg-gray-50 flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>지원 현황</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-[#2F3036] hover:bg-gray-50 flex items-center space-x-2">
                        <Building className="w-4 h-4" />
                        <span>찜한 공고</span>
                      </button>
                      <Separator className="my-2" />
                      <button className="w-full text-left px-4 py-2 text-sm text-[#2F3036] hover:bg-gray-50 flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>설정</span>
                      </button>
                      <button 
                        onClick={() => window.location.href = '/api/logout'}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-web py-8 pb-20">
        <div className="w-full space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-title text-[#2F3036]">안녕하세요, {getUserDisplayName()}님! 👋</CardTitle>
              <CardDescription className="text-[#2F3036]/70">
                오늘도 새로운 기회를 찾아보세요. AI가 맞춤형 채용정보를 추천해드립니다.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-[#F5F5DC] rounded-lg">
                    <Briefcase className="w-5 h-5 text-[#2F3036]" />
                  </div>
                  <div className="ml-4">
                    <div className="text-label text-[#2F3036]/70">추천 공고</div>
                    <div className="text-title font-semibold text-[#2F3036]">{jobRecommendations.length}개</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-[#F5F5DC] rounded-lg">
                    <FileText className="w-5 h-5 text-[#2F3036]" />
                  </div>
                  <div className="ml-4">
                    <div className="text-label text-[#2F3036]/70">지원 현황</div>
                    <div className="text-title font-semibold text-[#2F3036]">3개</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-[#F5F5DC] rounded-lg">
                    <Award className="w-5 h-5 text-[#2F3036]" />
                  </div>
                  <div className="ml-4">
                    <div className="text-label text-[#2F3036]/70">프로필 완성도</div>
                    <div className="text-title font-semibold text-[#2F3036]">75%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-heading text-[#2F3036]">빠른 실행</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/individual/profile-setup">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border-[#2F3036]/20 text-[#2F3036] hover:bg-[#F5F5DC]" data-testid="button-profile-setup">
                    <User className="w-6 h-6" />
                    <span className="text-sm">프로필 편집</span>
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border-[#2F3036]/20 text-[#2F3036] hover:bg-[#F5F5DC]" data-testid="button-job-search">
                    <Search className="w-6 h-6" />
                    <span className="text-sm">공고 찾기</span>
                  </Button>
                </Link>
                <Link href="/individual/job-category-selection">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border-[#2F3036]/20 text-[#2F3036] hover:bg-[#F5F5DC]" data-testid="button-job-categories">
                    <Building className="w-6 h-6" />
                    <span className="text-sm">직종 선택</span>
                  </Button>
                </Link>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border-[#2F3036]/20 text-[#2F3036] hover:bg-[#F5F5DC]" data-testid="button-ai-resume">
                  <Wand2 className="w-6 h-6" />
                  <span className="text-sm">AI 이력서</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-heading text-[#2F3036]">최근 활동</CardTitle>
                <Link href="/activity">
                  <Button size="sm" variant="ghost" className="text-[#2F3036] hover:bg-[#F5F5DC]">
                    전체보기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-[#2F3036]/10">
                  <div className="w-8 h-8 bg-[#F5F5DC] rounded-full flex items-center justify-center">
                    <Eye className="w-4 h-4 text-[#2F3036]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#2F3036]">삼성전자 - 소프트웨어 엔지니어 공고를 확인했습니다</div>
                    <div className="text-xs text-[#2F3036]/70">2시간 전</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-[#2F3036]/10">
                  <div className="w-8 h-8 bg-[#F5F5DC] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#2F3036]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#2F3036]">프로필 정보를 업데이트했습니다</div>
                    <div className="text-xs text-[#2F3036]/70">어제</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Bottom Bar for Touch Interactions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 shadow-lg z-50">
        <div className="flex justify-center space-x-6">
          <button
            onClick={() => setActiveBottomSection(activeBottomSection === 'categories' ? null : 'categories')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeBottomSection === 'categories' 
                ? 'bg-[#F5F5DC] text-[#2F3036]' 
                : 'text-[#2F3036]/70 hover:text-[#2F3036]'
            }`}
            data-testid="button-categories"
          >
            <Layers className="w-4 h-4" />
            <span className="text-xs font-medium">인기 직종</span>
          </button>
          
          <button
            onClick={() => setActiveBottomSection(activeBottomSection === 'jobs' ? null : 'jobs')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeBottomSection === 'jobs' 
                ? 'bg-[#F5F5DC] text-[#2F3036]' 
                : 'text-[#2F3036]/70 hover:text-[#2F3036]'
            }`}
            data-testid="button-jobs"
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-xs font-medium">추천 공고</span>
          </button>
          
          <button
            onClick={() => setActiveBottomSection(activeBottomSection === 'courses' ? null : 'courses')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeBottomSection === 'courses' 
                ? 'bg-[#F5F5DC] text-[#2F3036]' 
                : 'text-[#2F3036]/70 hover:text-[#2F3036]'
            }`}
            data-testid="button-courses"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-medium">추천강좌</span>
          </button>
          
          <button
            onClick={() => setActiveBottomSection(activeBottomSection === 'profile' ? null : 'profile')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeBottomSection === 'profile' 
                ? 'bg-[#F5F5DC] text-[#2F3036]' 
                : 'text-[#2F3036]/70 hover:text-[#2F3036]'
            }`}
            data-testid="button-profile-quick"
          >
            <User className="w-4 h-4" />
            <span className="text-xs font-medium">내 프로필</span>
          </button>
        </div>
      </div>

      {/* Bottom Content Panel */}
      {activeBottomSection && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 max-h-80 overflow-y-auto">
          <div className="p-4">
            {activeBottomSection === 'categories' && (
              <div>
                <h3 className="text-lg font-semibold text-[#2F3036] mb-4">인기 직종</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Users, label: "고객상담", count: "24개" },
                    { icon: Building, label: "사무직", count: "18개" },
                    { icon: FileText, label: "관리직", count: "12개" },
                    { icon: Award, label: "전문직", count: "8개" }
                  ].map((category, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-[#F5F5DC] cursor-pointer border-[#2F3036]/20">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <category.icon className="w-6 h-6 text-[#2F3036]" />
                        <div className="text-sm font-medium text-[#2F3036]">{category.label}</div>
                        <div className="text-xs text-[#2F3036]/70">{category.count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeBottomSection === 'jobs' && (
              <div>
                <h3 className="text-lg font-semibold text-[#2F3036] mb-4">추천 공고</h3>
                <div className="space-y-3">
                  {jobRecommendations?.slice(0, 3).map((job) => (
                    <div key={job.id} className="border rounded-lg p-3 hover:bg-[#F5F5DC] border-[#2F3036]/20">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-[#2F3036] text-sm">{job.title}</h4>
                        <Badge variant="secondary" className="text-xs bg-[#F5F5DC] text-[#2F3036]">{job.matchingScore}% 매칭</Badge>
                      </div>
                      <p className="text-xs text-[#2F3036]/70 mb-1">{job.companyName} • {job.location}</p>
                      <p className="text-xs text-[#2F3036]/50">{job.employmentType} • {job.salaryRange}</p>
                    </div>
                  ))}
                  {(!jobRecommendations || jobRecommendations.length === 0) && (
                    <div className="text-center py-4 text-[#2F3036]/70 text-sm">
                      추천 공고가 없습니다. 프로필을 완성하면 맞춤 추천을 받을 수 있습니다.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeBottomSection === 'courses' && (
              <div>
                <h3 className="text-lg font-semibold text-[#2F3036] mb-4">추천 강좌</h3>
                <div className="space-y-3">
                  <div className="text-center py-6">
                    <BookOpen className="w-12 h-12 text-[#2F3036]/40 mx-auto mb-3" />
                    <p className="text-sm text-[#2F3036]/70 mb-3">
                      AI가 당신의 프로필을 분석하여<br />
                      맞춤형 교육과정을 추천해드립니다
                    </p>
                    <Link href="/individual/recommended-courses">
                      <Button size="sm" className="bg-[#2F3036] text-white hover:bg-[#2F3036]/90">
                        추천 강좌 보기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeBottomSection === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-[#2F3036] mb-4">내 프로필 요약</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-[#2F3036]/70" />
                    <span className="text-sm font-medium text-[#2F3036]">{getUserDisplayName()}</span>
                  </div>
                  {(profile as UserProfile)?.summary && (
                    <div className="text-sm text-[#2F3036]/70">
                      <strong>자기소개:</strong> {(profile as UserProfile).summary?.slice(0, 100)}...
                    </div>
                  )}
                  {(profile as UserProfile)?.skills && (profile as UserProfile).skills!.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-[#2F3036] mb-2">주요 스킬</div>
                      <div className="flex flex-wrap gap-1">
                        {(profile as UserProfile).skills!.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-[#F5F5DC] text-[#2F3036]">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Link href="/individual/profile-view">
                      <Button size="sm" className="text-xs bg-[#2F3036] text-white hover:bg-[#2F3036]/90">상세보기</Button>
                    </Link>
                    <Link href="/individual/profile-setup">
                      <Button size="sm" variant="outline" className="text-xs border-[#2F3036] text-[#2F3036] hover:bg-[#F5F5DC]">편집</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}