import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Filter, Users, Lightbulb, Eye } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { JobPosting, AiRecommendation } from '@shared/schema';

interface RecommendedCandidate {
  id: string;
  name: string;
  age: number;
  experience: string;
  matchingScore: number;
  keyStrengths: string[];
  reasoning: string;
  profileSummary: string;
}

export default function AIRecommendations() {
  const [, setLocation] = useLocation();
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch company jobs for filter
  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['/api/jobs/my'],
    enabled: !!user,
  });

  // Mock recommended candidates since we don't have real individual profiles yet
  const mockCandidates: RecommendedCandidate[] = [
    {
      id: '1',
      name: '김영희',
      age: 58,
      experience: '카페 운영 12년 경력',
      matchingScore: 96,
      keyStrengths: ['커피 전문 지식', '고객 서비스', '매장 운영', '시간 협의 가능'],
      reasoning: '개인 카페 운영 경험으로 커피 전문성과 고객 응대 능력이 뛰어나며, 시간 협의 가능을 희망하여 귀사 조건과 완벽히 부합합니다.',
      profileSummary: '12년간 개인 카페를 운영하며 고객 서비스와 매장 관리에 전문성을 쌓았습니다.',
    },
    {
      id: '2',
      name: '박민수',
      age: 61,
      experience: '호텔 F&B 부서 15년 경력',
      matchingScore: 89,
      keyStrengths: ['음료 조리', '서비스 관리', '팀 리더십', '고급 서비스'],
      reasoning: '호텔급 서비스 경험으로 고품질 음료 제조와 고객 만족도 향상에 특화되어 있어, 프리미엄 카페 운영에 적합합니다.',
      profileSummary: '15년간 호텔 F&B 부서에서 음료 서비스와 팀 관리를 담당했습니다.',
    },
    {
      id: '3',
      name: '이정숙',
      age: 56,
      experience: '프랜차이즈 매장 관리 8년 경력',
      matchingScore: 85,
      keyStrengths: ['매장 관리', '직원 교육', '고객 관리', '바리스타 교육 수료'],
      reasoning: '최근 바리스타 교육과정을 수료하고 새로운 도전을 원하는 상태로, 기존 매장 관리 경험과 신규 기술이 조화를 이룹니다.',
      profileSummary: '프랜차이즈 매장 관리 경험과 함께 최근 바리스타 교육과정을 수료했습니다.',
    },
  ];

  const sendInterviewOfferMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      // In a real implementation, this would send an interview offer
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "면접 제안 발송 완료",
        description: "후보자에게 면접 제안이 전송되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "발송 실패",
        description: "면접 제안 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const handleSendInterviewOffer = (candidateId: string, candidateName: string) => {
    if (window.confirm(`${candidateName}님에게 면접 제안을 보내시겠습니까?`)) {
      sendInterviewOfferMutation.mutate(candidateId);
    }
  };

  const getMatchingScoreColor = (score: number) => {
    if (score >= 95) return 'status-badge bg-secondary/10 text-secondary';
    if (score >= 85) return 'status-badge bg-accent/10 text-accent';
    return 'status-badge bg-primary/10 text-primary';
  };

  const getActiveJobTitles = () => {
    if (!jobs) return [];
    return jobs
      .filter((job: JobPosting) => job.status === 'active')
      .map((job: JobPosting) => ({ id: job.id, title: job.title }));
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-border sticky top-0 z-10 safe-area-top">
        <div className="flex items-center">
          <Link href="/company/dashboard">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h2 className="flex-1 text-heading font-bold text-center">AI 인재 추천</h2>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0" data-testid="button-filter">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body font-bold">공고별 추천 인재</h3>
          </div>
          
          {/* Job Filter Tabs */}
          {loadingJobs ? (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              <div className="h-10 bg-gray-200 rounded-full w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-full w-24 animate-pulse"></div>
            </div>
          ) : (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {getActiveJobTitles().map((job) => (
                <Button
                  key={job.id}
                  variant={selectedJobId === job.id ? "default" : "outline"}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedJobId === job.id 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-700 border hover:bg-gray-200'
                  }`}
                  data-testid={`job-filter-${job.id}`}
                >
                  {job.title}
                </Button>
              ))}
              <Button
                variant={selectedJobId === '' ? "default" : "outline"}
                onClick={() => setSelectedJobId('')}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedJobId === '' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 border hover:bg-gray-200'
                }`}
                data-testid="job-filter-all"
              >
                전체
              </Button>
            </div>
          )}
        </div>
        
        {/* AI Recommendation Header */}
        <div className="gradient-secondary/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mr-3">
              <Users className="text-secondary w-6 h-6" />
            </div>
            <div>
              <h3 className="text-body font-bold">AI 분석 결과</h3>
              <p className="text-sm text-gray-600">
                {selectedJobId ? '선택한 공고에' : '귀사의 공고에'} 딱 맞는 인재를 추천해드립니다
              </p>
            </div>
          </div>
        </div>
        
        {/* Recommended Candidates */}
        <div className="space-y-4">
          {mockCandidates.map((candidate) => (
            <div key={candidate.id} className="card-mobile" data-testid={`candidate-${candidate.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Users className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-body font-bold" data-testid="candidate-name">
                      {candidate.name}님 ({candidate.age}세)
                    </h4>
                    <p className="text-gray-600">{candidate.experience}</p>
                  </div>
                </div>
                <Badge className={getMatchingScoreColor(candidate.matchingScore)} data-testid="matching-score">
                  {candidate.matchingScore}% 매칭
                </Badge>
              </div>
              
              <div className="mb-4">
                <h5 className="text-body font-semibold mb-2">핵심 역량</h5>
                <div className="flex flex-wrap gap-2">
                  {candidate.keyStrengths.map((strength, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-3 py-1 bg-gray-100 text-sm"
                      data-testid={`strength-${index}`}
                    >
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-start">
                  <Lightbulb className="text-accent w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>AI 분석:</strong> {candidate.reasoning}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 py-3 text-body"
                  data-testid="button-view-profile"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  프로필 상세보기
                </Button>
                <Button
                  onClick={() => handleSendInterviewOffer(candidate.id, candidate.name)}
                  className="flex-1 btn-primary py-3"
                  disabled={sendInterviewOfferMutation.isPending}
                  data-testid="button-send-offer"
                >
                  {sendInterviewOfferMutation.isPending ? '발송 중...' : '면접 제안 보내기'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* No candidates message */}
        {mockCandidates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-body font-semibold mb-2">추천 인재가 없습니다</h4>
            <p className="text-gray-600 mb-4">
              현재 등록된 공고에 맞는 인재가 없습니다.<br />
              공고 내용을 더 자세히 작성하거나 조건을 조정해보세요.
            </p>
            <Link href="/company/job-posting">
              <Button className="btn-primary">새 공고 등록하기</Button>
            </Link>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8">
          <div className="card-mobile bg-blue-50">
            <div className="flex items-start">
              <Lightbulb className="text-primary w-6 h-6 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-body font-semibold mb-2">AI 추천 팁</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 구체적인 직무 내용을 작성할수록 더 정확한 매칭이 가능합니다</li>
                  <li>• 시니어 우대 표시를 하면 50+ 인재들의 지원이 늘어납니다</li>
                  <li>• 시간 협의 가능으로 설정하면 더 많은 후보를 만날 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
