import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from '@/components/ui/mobile-nav';
import { JobCard } from '@/components/ui/job-card';
import { VoiceInput } from '@/components/ui/voice-input';
import { ArrowLeft, Mic, Filter, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { JobPosting } from '@shared/schema';

export default function JobSearch() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'jobs' | 'education'>('jobs');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get query parameters from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    const location = urlParams.get('location');
    
    if (q) setSearchQuery(q);
    if (location) setLocationFilter(location);
  }, []);

  // Search jobs
  const { data: jobs, isLoading: loadingJobs, refetch: refetchJobs } = useQuery({
    queryKey: ['/api/jobs', { q: searchQuery, location: locationFilter }],
    enabled: false, // Manual trigger
  });

  // Search education programs
  const { data: educationPrograms, isLoading: loadingEducation, refetch: refetchEducation } = useQuery({
    queryKey: ['/api/education-programs', { q: searchQuery }],
    enabled: false, // Manual trigger
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
      coverLetter: "검색을 통한 지원입니다."
    }),
    onSuccess: () => {
      toast({
        title: "지원 완료",
        description: "성공적으로 지원되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/my'] });
    },
  });

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (activeTab === 'jobs') {
      refetchJobs();
    } else {
      refetchEducation();
    }
  };

  const handleVoiceSearch = (transcript: string) => {
    setSearchQuery(transcript);
    setTimeout(() => {
      if (activeTab === 'jobs') {
        refetchJobs();
      } else {
        refetchEducation();
      }
    }, 100);
  };

  const handleSaveJob = (jobId: string) => {
    saveJobMutation.mutate(jobId);
  };

  const handleUnsaveJob = (jobId: string) => {
    unsaveJobMutation.mutate(jobId);
  };

  const handleApplyJob = (jobId: string) => {
    applyJobMutation.mutate(jobId);
  };

  // Trigger initial search if query exists
  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, [searchQuery, activeTab]);

  const popularSearches = [
    '바리스타', '시설관리', '매장관리', '상담', '사회복지', 
    '경비', '청소', '요리', '운전', '배송'
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-border sticky top-0 z-10 safe-area-top">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/individual/dashboard')}
            className="w-10 h-10 p-0"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="flex-1 text-heading font-bold text-center">탐색</h2>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0" data-testid="button-filter">
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-4">
          <Input
            type="text"
            placeholder="직무나 분야를 검색해보세요"
            className="w-full p-4 rounded-2xl text-body pr-12"
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

        {/* Location Filter */}
        <div className="relative">
          <Input
            type="text"
            placeholder="지역을 입력하세요 (선택)"
            className="w-full p-3 rounded-xl text-body pl-10"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            data-testid="input-location"
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="p-4">
        {/* Tab Navigation */}
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'jobs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-2 rounded-full whitespace-nowrap ${
              activeTab === 'jobs' ? 'bg-primary text-white' : 'bg-white text-gray-700 border'
            }`}
            data-testid="tab-jobs"
          >
            채용 공고
          </Button>
          <Button
            variant={activeTab === 'education' ? 'default' : 'outline'}
            onClick={() => setActiveTab('education')}
            className={`px-6 py-2 rounded-full whitespace-nowrap ${
              activeTab === 'education' ? 'bg-primary text-white' : 'bg-white text-gray-700 border'
            }`}
            data-testid="tab-education"
          >
            교육 프로그램
          </Button>
        </div>

        {/* Popular Searches */}
        {!searchQuery && (
          <div className="mb-6">
            <h3 className="text-body font-semibold mb-3">인기 검색어</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <Badge
                  key={term}
                  variant="outline"
                  className="px-3 py-2 cursor-pointer text-body bg-gray-50 hover:bg-primary hover:text-white transition-colors"
                  onClick={() => {
                    setSearchQuery(term);
                    setTimeout(handleSearch, 100);
                  }}
                  data-testid={`popular-search-${term}`}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {activeTab === 'jobs' && (
          <div>
            {loadingJobs ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-body font-semibold" data-testid="text-search-results">
                    검색 결과 {jobs.length}개
                  </h3>
                  <Button variant="outline" size="sm" data-testid="button-sort">
                    최신순
                  </Button>
                </div>
                
                {jobs.map((job: JobPosting) => (
                  <JobCard
                    key={job.id}
                    job={{
                      ...job,
                      company: { companyName: '채용기업' },
                      matchingScore: Math.floor(Math.random() * 30) + 70, // 70-100% range
                    }}
                    onSave={handleSaveJob}
                    onUnsave={handleUnsaveJob}
                    onApply={handleApplyJob}
                    showMatchingScore={true}
                  />
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-body font-semibold mb-2">검색 결과가 없습니다</h4>
                <p className="text-gray-600 mb-4">
                  다른 키워드로 다시 검색해보세요
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery('')}
                  data-testid="button-clear-search"
                >
                  검색어 지우기
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {/* Education Programs Tab */}
        {activeTab === 'education' && (
          <div>
            {loadingEducation ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
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
            ) : educationPrograms && educationPrograms.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-body font-semibold">
                    교육 프로그램 {educationPrograms.length}개
                  </h3>
                </div>
                
                {educationPrograms.map((program: any) => (
                  <div key={program.id} className="card-mobile" data-testid={`education-program-${program.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-body font-bold mb-1">{program.title}</h4>
                        <p className="text-gray-600 mb-2">{program.provider}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{program.duration}</span>
                          {program.isGovernmentFunded && (
                            <>
                              <span className="mx-2">·</span>
                              <Badge className="status-badge status-success">국비지원</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {program.description}
                    </p>
                    
                    <Button className="w-full btn-primary">
                      자세히 보기
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-body font-semibold mb-2">교육 프로그램이 없습니다</h4>
                <p className="text-gray-600 mb-4">
                  다른 키워드로 다시 검색해보세요
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Voice Search Modal */}
      <VoiceInput
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onTranscript={handleVoiceSearch}
        placeholder={`${activeTab === 'jobs' ? '직무나 분야' : '교육 과정'}를 말씀해주세요`}
      />

      {/* Bottom Navigation */}
      <MobileNav type="individual" />
    </div>
  );
}
