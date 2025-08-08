import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from '@/components/ui/mobile-nav';
import { Plus, Users, Bell, Building, Eye, Edit, Clock, Bot } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import type { JobPosting, CompanyProfile } from '@shared/schema';

export default function CompanyDashboard() {
  const { user } = useAuth();

  // Fetch company profile
  const { data: companyProfile } = useQuery({
    queryKey: ['/api/company-profiles/me'],
    enabled: !!user,
  });

  // Fetch company jobs
  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['/api/jobs/my'],
    enabled: !!user,
  });

  const getTotalApplications = () => {
    if (!jobs) return 0;
    return jobs.reduce((total: number, job: JobPosting) => total + (job.applicationCount || 0), 0);
  };

  const getActiveJobsCount = () => {
    if (!jobs) return 0;
    return jobs.filter((job: JobPosting) => job.status === 'active').length;
  };

  const getNewApplicationsCount = () => {
    // In a real app, this would be calculated from recent applications
    return Math.floor(Math.random() * 8) + 1;
  };

  const formatJobDeadline = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return '마감됨';
    if (diffDays === 1) return '내일 마감';
    return `${diffDays}일 남음`;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="gradient-primary px-4 py-6 text-white safe-area-top">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <Building className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-body font-bold" data-testid="text-company-name">
                {companyProfile?.companyName || '회사명'}
              </h2>
              <div className="flex items-center text-sm opacity-90">
                {companyProfile?.isVerified && (
                  <Badge className="bg-white/20 text-white text-xs mr-2">
                    인증된 기업
                  </Badge>
                )}
                <span>{companyProfile?.businessType || '업종'}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0 bg-white/20 hover:bg-white/30"
            data-testid="button-notifications"
          >
            <Bell className="text-white w-5 h-5" />
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-2xl p-4 text-center" data-testid="stat-active-jobs">
            <div className="text-large font-bold">{getActiveJobsCount()}</div>
            <div className="text-sm opacity-90">진행중 공고</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center" data-testid="stat-total-applications">
            <div className="text-large font-bold">{getTotalApplications()}</div>
            <div className="text-sm opacity-90">총 지원자</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center" data-testid="stat-new-applications">
            <div className="text-large font-bold">{getNewApplicationsCount()}</div>
            <div className="text-sm opacity-90">새 지원자</div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/company/job-posting">
            <div className="gradient-primary text-white p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow" data-testid="button-create-job">
              <Plus className="w-8 h-8 mx-auto mb-2" />
              <p className="text-body font-bold">새 공고 등록</p>
            </div>
          </Link>
          
          <Link href="/company/ai-recommendations">
            <div className="gradient-secondary text-white p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow" data-testid="button-ai-recommendations">
              <Bot className="w-8 h-8 mx-auto mb-2" />
              <p className="text-body font-bold">AI 인재 추천</p>
            </div>
          </Link>
        </div>
        
        {/* Active Job Postings */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body font-bold">진행중인 공고</h3>
            <Link href="/company/jobs">
              <Button variant="outline" size="sm" data-testid="button-view-all-jobs">
                전체보기
              </Button>
            </Link>
          </div>
          
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
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.slice(0, 3).map((job: JobPosting) => (
                <div key={job.id} className="card-mobile" data-testid={`job-posting-${job.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-body font-bold mb-1" data-testid="job-title">
                        {job.title}
                      </h4>
                      <p className="text-gray-600 mb-2">
                        {job.location} · {job.workSchedule === 'flexible' ? '시간협의 가능' : '고정근무'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatJobDeadline(job.endDate)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="status-badge status-warning mb-2" data-testid="application-count">
                        지원자 {job.applicationCount || 0}명
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/company/applications/${job.id}`}>
                      <Button 
                        variant="outline" 
                        className="flex-1 py-3 text-body"
                        data-testid="button-view-applicants"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        지원자 보기
                      </Button>
                    </Link>
                    <Link href={`/company/job-edit/${job.id}`}>
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="px-4 py-3"
                        data-testid="button-edit-job"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-mobile text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-body font-semibold mb-2">등록된 공고가 없습니다</h4>
              <p className="text-gray-600 mb-4">첫 번째 채용 공고를 등록해보세요</p>
              <Link href="/company/job-posting">
                <Button className="btn-primary">공고 등록하기</Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* AI Talent Recommendations Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body font-bold">AI 추천 인재</h3>
            <Link href="/company/ai-recommendations">
              <Button variant="ghost" className="text-primary text-body font-semibold" data-testid="button-view-all-recommendations">
                전체보기
              </Button>
            </Link>
          </div>
          
          <div className="card-mobile" data-testid="ai-recommendation-preview">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Users className="text-primary w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-body font-bold">김영희님</h4>
                <p className="text-gray-600">카페 운영 12년 경력</p>
              </div>
              <Badge className="status-badge status-success">96% 매칭</Badge>
            </div>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              시니어 바리스타 공고와 완벽하게 맞는 경력을 보유하고 있습니다. 
              개인 카페 운영 경험으로 고객 서비스와 커피 전문성이 뛰어납니다.
            </p>
            
            <Button 
              className="w-full btn-primary"
              data-testid="button-send-interview-offer"
            >
              면접 제안 보내기
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <MobileNav type="company" />
    </div>
  );
}
