import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/ui/mobile-nav';
import { JobCard } from '@/components/ui/job-card';
import { ArrowLeft, Heart, Briefcase } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { JobPosting } from '@shared/schema';

export default function SavedJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved jobs
  const { data: savedJobs, isLoading } = useQuery({
    queryKey: ['/api/saved-jobs'],
    enabled: !!user,
  });

  // Unsave job mutation
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

  // Apply to job mutation
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

  const handleUnsaveJob = (jobId: string) => {
    unsaveJobMutation.mutate(jobId);
  };

  const handleApplyJob = (jobId: string) => {
    applyJobMutation.mutate(jobId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-sm mx-auto bg-white min-h-screen relative">
          {/* Header */}
          <div className="mobile-header bg-gradient-to-r from-primary to-secondary text-white relative overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <Link href="/individual/dashboard">
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0 bg-white/20 hover:bg-white/30">
                  <ArrowLeft className="text-white w-5 h-5" />
                </Button>
              </Link>
              
              <h1 className="text-xl font-bold">찜한 공고</h1>
              
              <div className="w-10 h-10"></div>
            </div>
          </div>

          {/* Loading */}
          <div className="p-4 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">로딩 중...</p>
          </div>

          <MobileNav type="individual" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-sm mx-auto bg-white min-h-screen relative">
        {/* Header */}
        <div className="mobile-header bg-gradient-to-r from-primary to-secondary text-white relative overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <Link href="/individual/dashboard">
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 bg-white/20 hover:bg-white/30">
                <ArrowLeft className="text-white w-5 h-5" />
              </Button>
            </Link>
            
            <h1 className="text-xl font-bold">찜한 공고</h1>
            
            <div className="w-10 h-10"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-20">
          {savedJobs && Array.isArray(savedJobs) && savedJobs.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium text-gray-700">총 {savedJobs.length}개의 관심 공고</span>
              </div>
              
              {savedJobs.map((job: JobPosting) => (
                <JobCard
                  key={job.id}
                  job={{
                    ...job,
                    company: { companyName: '우수기업' },
                    matchingScore: Math.floor(Math.random() * 20) + 80,
                  }}
                  onSave={() => {}} // Already saved
                  onUnsave={handleUnsaveJob}
                  onApply={handleApplyJob}
                  showMatchingScore={true}

                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">찜한 공고가 없습니다</h3>
              <p className="text-gray-600 mb-6">관심 있는 공고를 저장해보세요</p>
              <Link href="/individual/search">
                <Button className="bg-primary hover:bg-primary/90">
                  <Briefcase className="w-4 h-4 mr-2" />
                  공고 탐색하기
                </Button>
              </Link>
            </div>
          )}
        </div>

        <MobileNav type="individual" />
      </div>
    </div>
  );
}