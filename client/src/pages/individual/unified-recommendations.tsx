import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Briefcase, 
  Building2, 
  Building,
  GraduationCap, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar,
  Award,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import { apiRequest } from '@/lib/queryClient';

interface UnifiedRecommendation {
  profile: {
    years: number;
    education: string;
    skills: string[];
  };
  occupations: Array<{
    id: string;
    sector: string;
    title: string;
    minYears: number;
    reqEdu: string;
    skills: string[];
    score: number;
  }>;
  jobs: Array<{
    id: string;
    sector: string;
    title: string;
    company: string;
    minYears: number;
    reqEdu: string;
    skills: string[];
    location?: string;
    salary?: string;
    field?: string;
    experience?: string;
    deadline?: string;
    employmentType?: string;
    companySize?: string;
    score: number;
  }>;
  programs: Array<{
    id: string;
    title: string;
    skills: string[];
    duration?: string;
    provider?: string;
    type: 'online' | 'offline';
    cover: number;
    relevance: number;
  }>;
}

export default function UnifiedRecommendations() {
  const [location, setLocation] = useLocation();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState<string>('');

  useEffect(() => {
    const sectors = localStorage.getItem('selectedSectors');
    const text = localStorage.getItem('resumeText');
    
    if (sectors) setSelectedSectors(JSON.parse(sectors));
    if (text) setResumeText(text);
    
    if (!sectors || !text) {
      setLocation('/dashboard');
    }
  }, [setLocation]);

  const { data: recommendations, isLoading, error } = useQuery<UnifiedRecommendation>({
    queryKey: ['/api/unified-recommendations', resumeText, selectedSectors],
    queryFn: async () => {
      console.log('Making API request with:', { resumeText, selectedSectors });
      const response = await apiRequest('POST', '/api/unified-recommendations', {
        resumeText,
        chosenSectors: selectedSectors
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response received:', {
        hasProfile: !!result.profile,
        jobsCount: result.jobs?.length || 0,
        programsCount: result.programs?.length || 0,
        occupationsCount: result.occupations?.length || 0
      });
      return result;
    },
    enabled: !!resumeText && selectedSectors.length > 0,
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return `매우 적합 ${score}%`;
    if (score >= 50) return `적합 ${score}%`;
    return `보통 ${score}%`;
  };

  const getSectorIcon = (sector: string) => {
    if (sector.includes('건설')) return '🏗️';
    if (sector.includes('정보통신')) return '💻';
    if (sector.includes('제조')) return '⚙️';
    if (sector.includes('의료')) return '🏥';
    if (sector.includes('마케팅')) return '📊';
    if (sector.includes('예술')) return '🎨';
    if (sector.includes('운수')) return '🚛';
    if (sector.includes('과학')) return '🔬';
    if (sector.includes('공급')) return '⚡';
    return '🏢';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-white">
        <header className="bg-white border-b border-[#2F3036]/10 px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-8 w-48" />
            <div className="w-20"></div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (error) {
    console.log('Query error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-[#2F3036] mb-4">추천을 불러오는 중 오류가 발생했습니다.</p>
            <p className="text-sm text-[#2F3036]/60 mb-4">{error?.message || '알 수 없는 오류'}</p>
            <Button onClick={() => setLocation('/dashboard')} className="bg-[#FF8C42] hover:bg-[#FF8C42]/90">
              대시보드로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-[#2F3036] mb-4">추천 데이터를 찾을 수 없습니다.</p>
            <Button onClick={() => setLocation('/dashboard')} className="bg-[#FF8C42] hover:bg-[#FF8C42]/90">
              대시보드로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-white">
      {/* Header */}
      <header className="bg-white border-b border-[#2F3036]/10 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/dashboard')}
            className="flex items-center gap-2 text-[#2F3036] hover:bg-[#F5F5DC]"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드
          </Button>
          <h1 className="text-xl font-bold text-[#2F3036]">맞춤 추천</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Summary Card */}
        <Card className="border-[#FF8C42]/30 bg-gradient-to-r from-[#FF8C42]/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-[#2F3036] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF8C42]" />
              추천 결과 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FF8C42]">{selectedSectors.length}</div>
                <div className="text-sm text-[#2F3036]/70">선택 업종</div>
                <div className="flex flex-wrap gap-1 mt-1 justify-center">
                  {selectedSectors.map(sector => (
                    <Badge key={sector} variant="outline" className="border-[#FF8C42] text-[#FF8C42] text-xs">
                      {getSectorIcon(sector)} {sector}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FF8C42]">{recommendations.jobs?.length || 0}</div>
                <div className="text-sm text-[#2F3036]/70">추천 공고</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FF8C42]">{recommendations.programs?.length || 0}</div>
                <div className="text-sm text-[#2F3036]/70">추천 교육</div>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Jobs Section */}
        <Card className="border-[#2F3036]/20">
          <CardHeader>
            <CardTitle className="text-[#2F3036] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#FF8C42]" />
              추천 공고 ({recommendations.jobs.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {recommendations.jobs.map((job) => (
                <Card key={job.id} className="border-[#2F3036]/20 hover:border-[#FF8C42]/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getSectorIcon(job.sector)}</span>
                        <div>
                          <CardTitle className="text-[#2F3036] text-lg">{job.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#2F3036]/70 font-medium">{job.company}</span>
                            <Badge variant="outline" className="border-[#2F3036]/20 text-[#2F3036] text-xs">
                              {job.sector}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getScoreColor(job.score)} font-medium`}>
                        {getScoreLabel(job.score)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 엑셀 파일에서 요청한 모든 상세 정보 표시 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#2F3036]/60" />
                          <span className="font-medium text-[#2F3036]">지역:</span>
                          <span className="text-[#2F3036]/70">{job.location || '정보 없음'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-[#2F3036]/60" />
                          <span className="font-medium text-[#2F3036]">학력:</span>
                          <span className="text-[#2F3036]/70">{job.reqEdu || '정보 없음'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#2F3036]/60" />
                          <span className="font-medium text-[#2F3036]">경력:</span>
                          <span className="text-[#2F3036]/70">{job.experience || '정보 없음'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-[#2F3036]/60" />
                          <span className="font-medium text-[#2F3036]">분야:</span>
                          <span className="text-[#2F3036]/70">{job.field || '정보 없음'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#2F3036]/60" />
                          <span className="font-medium text-[#2F3036]">고용형태:</span>
                          <span className="text-[#2F3036]/70">{job.employmentType || '정보 없음'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-[#2F3036]/60" />
                          <span className="font-medium text-[#2F3036]">기업규모:</span>
                          <span className="text-[#2F3036]/70">{job.companySize || '정보 없음'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-[#2F3036]/60" />
                          <span className="font-medium text-[#2F3036]">급여:</span>
                          <span className="text-[#2F3036]/70">{job.salary || '정보 없음'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#2F3036]/60" />
                          <span className="font-medium text-[#2F3036]">마감일:</span>
                          <span className="text-[#2F3036]/70">{job.deadline || '정보 없음'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {job.skills.length > 0 && (
                      <div>
                        <div className="text-sm text-[#2F3036]/70 mb-2">필요 기술</div>
                        <div className="flex flex-wrap gap-1">
                          {job.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="border-[#FF8C42]/30 text-[#FF8C42] text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <Button size="sm" className="bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        지원하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Programs Section */}
        <Card className="border-[#2F3036]/20">
          <CardHeader>
            <CardTitle className="text-[#2F3036] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#FF8C42]" />
              추천 교육 ({recommendations.programs.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              // 모든 프로그램의 매칭도가 0인지 확인
              const hasRelevantPrograms = recommendations.programs.some(program => 
                (program.cover || 0) + (program.relevance || 0) > 0
              );
              
              if (!hasRelevantPrograms) {
                return (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#FF8C42]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-[#FF8C42]/60" />
                    </div>
                    <p className="text-[#2F3036]/70 text-lg">해당 직무에 매칭되는 교육 프로그램이 없습니다.</p>
                    <p className="text-[#2F3036]/50 text-sm mt-2">다른 업종을 선택하거나 프로필을 업데이트해보세요.</p>
                  </div>
                );
              }
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.programs.map((program, index) => (
                    <Card key={`${program.id}-${index}`} className="border-[#2F3036]/20 hover:border-[#FF8C42]/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-[#2F3036] text-lg">{program.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              {program.provider && (
                                <span className="text-[#2F3036]/70 text-sm">{program.provider}</span>
                              )}
                              <Badge variant={program.type === 'online' ? 'default' : 'secondary'} className="text-xs">
                                {program.type === 'online' ? '온라인' : '오프라인'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-[#FF8C42]/10 text-[#FF8C42] border-[#FF8C42]/30">
                              추천도: {(program.cover || 0) + (program.relevance || 0)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {program.duration && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-[#2F3036]/60" />
                            <span className="text-[#2F3036]/70">기간: {program.duration}</span>
                          </div>
                        )}
                        
                        {program.skills.length > 0 && (
                          <div>
                            <div className="text-sm text-[#2F3036]/70 mb-2">학습 기술</div>
                            <div className="flex flex-wrap gap-1">
                              {program.skills.map((skill, skillIndex) => (
                                <Badge key={`${skill}-${skillIndex}`} variant="outline" className="border-[#FF8C42]/30 text-[#FF8C42] text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end">
                          <Button size="sm" className="bg-[#2F3036] hover:bg-[#2F3036]/90 text-white">
                            <Award className="w-4 h-4 mr-2" />
                            신청하기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}